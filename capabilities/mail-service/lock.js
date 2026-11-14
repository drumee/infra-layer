"use strict";
// Linux flock locks an open file description inherited by the short-lived helper.
// The parent keeps that same description open until the callback ends or dies.
const fs = require("node:fs"), { spawnSync } = require("node:child_process");
const F = require("../../lib/filesystem-safety");
const { resolveTrustedExecutable, systemEnvironment } = require("../../internal/system-tools");
module.exports = function lock(root, callback) {
  F.privateDirectory(root);
  const file = root + "/.mail-transport-lock";
  const fd = fs.openSync(file, fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_NOFOLLOW, 0o600);
  try {
    const s = fs.fstatSync(fd);
    if (!s.isFile() || s.nlink !== 1 || s.uid !== process.getuid() || (s.mode & 0o7777) !== 0o600) F.fail("MAIL_RESOURCE_IDENTITY_MISMATCH");
    const result = spawnSync(resolveTrustedExecutable("flock"), ["--exclusive", "--nonblock", "3"], { env: systemEnvironment("flock"), stdio: ["ignore", "pipe", "pipe", fd] });
    if (result.status === 1) F.fail("RESOURCE_LOCKED");
    if (result.error || result.status !== 0) F.fail("MAIL_DEPENDENCY_UNAVAILABLE");
    return callback();
  } finally { fs.closeSync(fd); }
};
