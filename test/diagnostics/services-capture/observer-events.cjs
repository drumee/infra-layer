"use strict";
function eventValue(line, project) {
  const value = JSON.parse(line), attributes = value.Actor?.Attributes || {};
  if (attributes["com.docker.compose.project"] && attributes["com.docker.compose.project"] !== project) throw new Error("EVENT_OWNER_MISMATCH");
  const [action, detail] = String(value.Action).split(": "), time = /"timeNano":\s*(\d+)/.exec(line)?.[1];
  if (!/^[a-z_]{1,40}$/.test(action) || !["container", "network"].includes(value.Type) || !/^[a-f0-9]{64}$/.test(value.Actor?.ID || "") || !time) throw new Error("EVENT_SCHEMA");
  const service = attributes["com.docker.compose.service"];
  if (service && !["dns", "database", "redis", "mail", "dkim", "capture"].includes(service)) throw new Error("EVENT_SERVICE");
  const exit = attributes.exitCode;
  if (action === "die" && !/^[0-9]{1,3}$/.test(exit || "")) throw new Error("EVENT_EXIT");
  return { project, action, type: value.Type, id: value.Actor.ID, service, time_nano: time, health: action === "health_status" && ["starting", "healthy", "unhealthy"].includes(detail) ? detail : undefined, exit_code: action === "die" ? exit : undefined };
}
class Collection {
  constructor() { this.containers = new Map(); this.rows = 0; }
  add(value) {
    this.rows++;
    if (value.type !== "container") return;
    if (!this.containers.has(value.id)) this.containers.set(value.id, new Set());
    this.containers.get(value.id).add(value.action);
  }
  complete(required) {
    if (!required || !Number.isInteger(required.min_creates) || required.min_creates < 1 || !Array.isArray(required.ids) || required.ids.length > 64 || required.ids.some(id => !/^[a-f0-9]{64}$/.test(id))) return false;
    const created = [...this.containers.entries()].filter(([, actions]) => actions.has("create"));
    return created.length >= required.min_creates && created.every(([, actions]) => ["create", "start", "die", "destroy"].every(action => actions.has(action))) && required.ids.every(id => ["create", "start", "die", "destroy"].every(action => this.containers.get(id)?.has(action)));
  }
}
module.exports = { eventValue, Collection };
