"use strict";
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { resolveTrustedExecutable, systemEnvironment } = require("../internal/system-tools");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const socket = ["--host", "unix:///var/run/docker.sock"];
function option(options, key, fallback) {
  if (Object.hasOwn(options, key)) return options[key];
  return fallback;
}
function docker(args, options = {}) {
  try {
    options = options ?? {};
    // Forward execution controls explicitly. Neither an opaque options object nor
    // caller shell/env settings reach child_process.
    const execution = {
      encoding: option(options, "encoding", "utf8"), stdio: option(options, "stdio", "pipe"),
      timeout: option(options, "timeout", 180000), maxBuffer: option(options, "maxBuffer", 8 * 1024 * 1024),
      input: options.input, cwd: options.cwd, uid: options.uid, gid: options.gid,
      killSignal: options.killSignal, windowsHide: options.windowsHide,
      windowsVerbatimArguments: options.windowsVerbatimArguments, argv0: options.argv0,
      shell: false, env: systemEnvironment("docker")
    };
    return execFileSync(resolveTrustedExecutable("docker"), [...socket, ...args], execution);
  }
  catch (error) {
    // Keep safe execution facts, never command payloads, credentials or raw output.
    throw Object.assign(new Error("DOCKER_LIFECYCLE_COMMAND_FAILED"), {
      code: "DOCKER_LIFECYCLE_COMMAND_FAILED", exit_status: error.status ?? null,
      signal: error.signal ?? null,
      object_missing: error.status === 1 && /no such (?:object|container|network)\b/i.test(String(error.stderr || ""))
    });
  }
}
function helper(composition, directory, script, args = [], writable = false) {
  F.directory(require("node:path").dirname(directory));
  const stat = fs.lstatSync(directory); if (!stat.isDirectory() || stat.isSymbolicLink()) F.fail("UNSAFE_RESOURCE_PATH");
  return docker(["run", "--rm", "--network", "none", "--read-only", "--cap-drop", "ALL", "--cap-add", "DAC_OVERRIDE", ...(writable ? ["--cap-add", "CHOWN", "--cap-add", "FOWNER"] : []), "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "128m", "--label", `org.drumee.infra.owner=${composition.project}`, "--label", "org.drumee.infra.role=lifecycle-helper", "--mount", `type=bind,source=${directory},target=/work${writable ? "" : ",readonly"}`, composition.distribution.helper_image, "node", "-e", script, ...args]);
}
function compose(prepared, args, options) { return docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, ...args], options); }
const format = '{"id":{{json .Id}},"image_id":{{json .Image}},"image":{{json .Config.Image}},"started_at":{{json .State.StartedAt}},"running":{{json .State.Running}},"exit_code":{{json .State.ExitCode}},"health":{{if index .State "Health"}}{{json .State.Health.Status}}{{else}}"unknown"{{end}},"owner":{{json (index .Config.Labels "org.drumee.infra.owner")}},"project":{{json (index .Config.Labels "com.docker.compose.project")}},"service":{{json (index .Config.Labels "com.docker.compose.service")}},"revision":{{json (index .Config.Labels "org.drumee.infra.revision")}},"ports":{{json .NetworkSettings.Ports}},"mounts":{{json .Mounts}}}';
function inspectProject(project, allowed_services) {
  if (!S.identifier(project)) F.fail("INVALID_DEPLOYMENT_IDENTITY");
  const ids = docker(["ps", "-a", "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{.ID}}"] ).trim().split("\n").filter(Boolean);
  const observations = [];
  for (const id of ids) {
    const observed = JSON.parse(docker(["inspect", "--format", format, id]));
    if (observed.owner !== project || observed.project !== project || !allowed_services.includes(observed.service) || !/^[a-f0-9]{64}$/.test(observed.id)) F.fail("DEPLOYMENT_OWNERSHIP_MISMATCH");
    observations.push(observed);
  }
  if (new Set(observations.map((value) => value.service)).size !== observations.length) F.fail("DUPLICATE_SERVICE_IDENTITY");
  return observations;
}
function checkImages(composition) {
  const images = [...new Set([composition.distribution.helper_image, ...Object.values(composition.compose.services).map((value) => value.image)])];
  const result = {};
  for (const image of images) {
    let inspected; try { inspected = JSON.parse(docker(["image", "inspect", "--format", '{"id":{{json .Id}},"digests":{{json .RepoDigests}}}', image])); } catch { F.fail("REFERENCED_IMAGE_UNAVAILABLE"); }
    const [repository, digest] = image.split("@"); const canonical = digest ? repository.replace(/:[^/:]+$/, "") + "@" + digest : image;
    if (image.startsWith("sha256:") ? inspected.id !== image : !inspected.digests?.includes(canonical)) F.fail("IMAGE_DIGEST_MISMATCH"); result[image] = inspected.id;
  }
  return result;
}
function networkObject(args, missing) {
  let value;
  try { value = docker(args); }
  catch (error) {
    if (!error.object_missing) throw error;
    throw Object.assign(new Error(missing), { code: missing, exit_status: error.exit_status });
  }
  try { return JSON.parse(value); } catch { F.fail("INVALID_NETWORK_ATTACHMENT"); }
}
function attachment(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !/^[a-f0-9]{64}$/.test(value.EndpointID || "") || typeof value.Name !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,255}$/.test(value.Name)) F.fail("INVALID_NETWORK_ATTACHMENT");
  // These are endpoint metadata, not authorization claims or executable inputs.
  const result = {};
  for (const key of ["Name", "EndpointID", "MacAddress", "IPv4Address", "IPv6Address"]) {
    if (typeof value[key] !== "string" || value[key].length > 256 || /[\r\n]/.test(value[key])) F.fail("INVALID_NETWORK_ATTACHMENT");
    result[key] = value[key];
  }
  return result;
}
function checkNetworks(composition, { require_existing = false } = {}) {
  if (!S.identifier(composition.project)) F.fail("INVALID_DEPLOYMENT_IDENTITY");
  if (typeof require_existing !== "boolean") F.fail("INVALID_NETWORK_ATTACHMENT");
  const names = docker(["network", "ls", "--format", "{{.Name}}"] ).trim().split("\n");
  const unsettled = [];
  for (const [role, network] of Object.entries(composition.compose.networks)) {
    if (!names.includes(network.name)) { if (require_existing) F.fail("REQUIRED_NETWORK_MISSING"); continue; }
    const observed = networkObject(["network", "inspect", "--format", '{"id":{{json .Id}},"name":{{json .Name}},"owner":{{json (index .Labels "org.drumee.infra.owner")}},"project":{{json (index .Labels "com.docker.compose.project")}},"driver":{{json .Driver}},"internal":{{json .Internal}},"containers":{{json .Containers}}}', network.name], "REQUIRED_NETWORK_MISSING");
    if (!observed || !/^[a-f0-9]{64}$/.test(observed.id || "") || observed.name !== network.name || observed.containers !== null && (typeof observed.containers !== "object" || Array.isArray(observed.containers))) F.fail("INVALID_NETWORK_ATTACHMENT");
    if (observed.owner !== composition.project || observed.project !== composition.project || observed.driver !== "bridge" || observed.internal !== (role === "mail-control")) F.fail("NETWORK_OWNERSHIP_MISMATCH");
    for (const [id, value] of Object.entries(observed.containers || {})) {
      const endpoint = attachment(value);
      if (id.startsWith("ep-")) {
        if (id !== "ep-" + endpoint.EndpointID) F.fail("INVALID_NETWORK_ATTACHMENT");
        const expected_name = Object.keys(composition.compose.services).some(service => {
          const prefix = composition.project + "-" + service + "-";
          return endpoint.Name.startsWith(prefix) && /^(?:[1-9][0-9]*|run-[a-f0-9]{12,64})$/.test(endpoint.Name.slice(prefix.length));
        });
        if (!expected_name) F.fail("UNEXPECTED_NETWORK_ATTACHMENT");
        unsettled.push({ network: network.name, key: id, ...endpoint });
        continue; // Still a refusal below, never authorization or readiness.
      }
      if (!/^[a-f0-9]{64}$/.test(id)) F.fail("INVALID_DOCKER_OBJECT_IDENTITY");
      const resource = networkObject(["container", "inspect", "--format", format.slice(0, -1) + ',"name":{{json .Name}},"networks":{{json .NetworkSettings.Networks}}}', id], "REQUIRED_CONTAINER_MISSING");
      if (!resource || typeof resource !== "object" || Array.isArray(resource)) F.fail("INVALID_NETWORK_ATTACHMENT");
      if (resource.owner !== composition.project || resource.project !== composition.project || !composition.compose.services[resource.service]) F.fail("NETWORK_OWNERSHIP_MISMATCH");
      if (resource.id !== id || resource.name !== "/" + endpoint.Name) F.fail("INVALID_NETWORK_ATTACHMENT");
      const membership = resource.networks?.[network.name], selected = composition.compose.services[resource.service].networks;
      if (!membership || membership.NetworkID !== observed.id || membership.EndpointID !== endpoint.EndpointID || !(Array.isArray(selected) ? selected.includes(role) : selected && Object.hasOwn(selected, role))) F.fail("NETWORK_ATTACHMENT_MISMATCH");
    }
  }
  // Validate every ordinary member/network first so an unsettled endpoint cannot
  // mask a foreign attachment. Metadata is retained, but not treated as owned.
  if (unsettled.length) throw Object.assign(new Error("NETWORK_ATTACHMENT_UNSETTLED"), { code: "NETWORK_ATTACHMENT_UNSETTLED", attachments: unsettled });
}
function checkPorts(composition, owned = []) {
  let output; try { output = execFileSync(resolveTrustedExecutable("ss"), ["-H", "-lntu"], { encoding: "utf8", stdio: "pipe", timeout: 10000, env: systemEnvironment("ss") }); } catch { F.fail("PORT_OBSERVATION_UNAVAILABLE"); }
  for (const service of Object.values(composition.compose.services)) for (const binding of service.ports || []) {
    const matches = output.split("\n").some((line) => { const fields = line.trim().split(/\s+/); if (fields[0] !== binding.protocol) return false; const local = fields[4]; if (!local) return false; const index = local.lastIndexOf(":"); const address = local.slice(0, index).replace(/^\[|\]$/g, ""); return local.slice(index + 1) === String(binding.published) && (address === binding.host_ip || ["*", "0.0.0.0", "::"].includes(address) || ["0.0.0.0", "::"].includes(binding.host_ip)); });
    const ours = owned.some((value) => Object.values(value.ports || {}).flat().filter(Boolean).some((port) => port.HostPort === String(binding.published) && port.HostIp === binding.host_ip));
    if (matches && !ours) F.fail("CONFLICTING_PORT_BINDING");
  }
  const ids = docker(["ps", "--format", "{{.ID}}"] ).trim().split("\n").filter(Boolean);
  for (const id of ids) {
    if (owned.some((value) => value.id.startsWith(id))) continue;
    const ports = JSON.parse(docker(["inspect", "--format", "{{json .NetworkSettings.Ports}}", id]));
    for (const [target, values] of Object.entries(ports || {})) for (const observed of values || []) for (const service of Object.values(composition.compose.services)) for (const binding of service.ports || []) if (target.endsWith("/" + binding.protocol) && observed.HostPort === String(binding.published) && (observed.HostIp === binding.host_ip || ["0.0.0.0", "::"].includes(observed.HostIp) || ["0.0.0.0", "::"].includes(binding.host_ip))) F.fail("CONFLICTING_PORT_BINDING");
  }
}
function prepareOwnership(composition, records, candidate) {
  const script = `const fs=require('node:fs'),path=require('node:path');for(const r of JSON.parse(process.argv[1])){const file=path.join('/work',r.path);if(!file.startsWith('/work/'))throw Error('scope');const stat=fs.lstatSync(file);if(stat.isSymbolicLink()||(!stat.isFile()&&!stat.isDirectory()))throw Error('type');fs.chownSync(file,r.uid,r.gid);fs.chmodSync(file,r.mode);}`;
  helper(composition, candidate, script, [JSON.stringify(records)], true);
}
function inventory(composition, directory) {
  const script = `const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');const records=[];function scan(p){for(const name of fs.readdirSync(p).sort()){const file=path.join(p,name),s=fs.lstatSync(file),rel=path.relative('/work',file);if(s.isSymbolicLink()||(!s.isDirectory()&&!s.isFile())||s.isFile()&&s.nlink!==1)throw Error('unsafe');if(s.isDirectory()){records.push({path:rel,type:'directory',uid:s.uid,gid:s.gid,mode:s.mode&4095});scan(file);}else{const fd=fs.openSync(file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW),h=crypto.createHash('sha256'),b=Buffer.alloc(65536);let n;while(n=fs.readSync(fd,b,0,b.length,null))h.update(b.subarray(0,n));fs.closeSync(fd);records.push({path:rel,type:'file',size:s.size,uid:s.uid,gid:s.gid,mode:s.mode&4095,digest:h.digest('hex')});}}}scan('/work');console.log(JSON.stringify(records));`;
  return JSON.parse(helper(composition, directory, script));
}
module.exports = { docker, helper, compose, inspectProject, checkImages, checkNetworks, checkPorts, prepareOwnership, inventory };
