"use strict";
// Explicit lifecycle subpath. The five root entry points retain their behavior.
module.exports = {
  composeDeployment: require("./composition").composeDeployment,
  prepareDeployment: require("./preparation").prepareDeployment,
  activateDeployment: require("./activation").activateDeployment,
  inspectDeployment: require("./activation").inspectDeployment,
  diagnoseDeployment: require("./activation").diagnoseDeployment,
  classifyChanges: require("./activation").classifyChanges,
  stopDeployment: require("./recovery").stopDeployment,
  backupDeployment: require("./recovery").backupDeployment,
  validateBackup: require("./recovery").validateBackup,
  restoreDeployment: require("./recovery").restoreDeployment,
  rollbackDeployment: require("./recovery").rollbackDeployment
};
