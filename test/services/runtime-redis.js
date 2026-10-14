"use strict";
// Runs the revision-pinned actual Essentials client, not a reimplementation.
const assert = require("node:assert/strict");
const RedisStore = require(process.env.IL2_REDIS_STORE_SOURCE);
async function main() {
  const instance = new RedisStore(); await instance.init(); const client = RedisStore.getClient(); assert.equal(await client.ping(), "PONG");
  const subscriber = await RedisStore.getSubscribe(); let received; await subscriber.subscribe(RedisStore.getLiveUpdateChannel(), (value) => { received = JSON.parse(value); });
  await RedisStore.publishLiveUpdate("fixture", { value: 7 });
  for (let i = 0; i < 100 && !received; i++) await new Promise((resolve) => setTimeout(resolve, 20));
  assert.deepEqual(received, { key: "fixture", data: { value: 7 } }); await subscriber.unsubscribe(); await subscriber.quit(); await RedisStore.GetPublisher().quit(); await client.quit();
  console.log("PINNED_RUNTIME_REDIS_AUTH_PUBSUB_OK");
}
main().catch(() => { console.error("PINNED_RUNTIME_REDIS_FAILED"); process.exitCode = 1; });
