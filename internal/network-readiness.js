"use strict";
const { performance } = require("node:perf_hooks");
function createNetworkReadiness({ now = () => performance.now(), delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)) } = {}) {
  return async function networksReady(composition, driver, require_existing) {
    const deadline = now() + 5000;
    for (;;) {
      try { return driver.checkNetworks(composition, { require_existing }); }
      catch (error) {
        // Re-observe only successful, unsettled metadata; never retry a Docker failure.
        if (error.code !== "NETWORK_ATTACHMENT_UNSETTLED" || now() >= deadline) throw error;
        await delay(50);
      }
    }
  };
}
module.exports = { createNetworkReadiness };
