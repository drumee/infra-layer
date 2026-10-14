"use strict";
// Explicit lifecycle subpath. The five root entry points retain their behavior.
module.exports = {
  composeDeployment: require("./composition").composeDeployment,
  prepareDeployment: require("./preparation").prepareDeployment,
  activateDeployment: require("./activation").activateDeployment,
  inspectDeployment: require("./activation").inspectDeployment,
  diagnoseDeployment: require("./activation").diagnoseDeployment,
  classifyChanges: require("./activation").classifyChanges
};
