"use strict";
const fs = require("node:fs"), path = require("node:path");
function readInterruptionInput(file) {
  const fail = () => { throw new Error("PRIVATE_INTERRUPTION_INPUT_REQUIRED"); };
  if (typeof file !== "string" || !path.isAbsolute(file) || file !== path.normalize(file) || path.basename(file) !== "interrupt-prepared.json") fail();
  const parent = path.dirname(file), match = /^drumee-il5-([a-f0-9]{8})-[A-Za-z0-9]{6}$/.exec(path.basename(parent));
  if (!match || fs.realpathSync(parent) !== parent) fail();
  const owner = fs.lstatSync(parent);
  if (!owner.isDirectory() || owner.uid !== process.getuid() || (owner.mode & 0o077)) fail();
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const info = fs.fstatSync(fd);
    if (!info.isFile() || info.uid !== owner.uid || info.nlink !== 1 || (info.mode & 0o077) || info.size > 4 * 1024 * 1024) fail();
    const prepared = JSON.parse(fs.readFileSync(fd, "utf8"));
    if (prepared.root !== path.join(parent, "deployment") || prepared.project !== "drumee-il5-" + match[1]) fail();
    return prepared;
  } finally { fs.closeSync(fd); }
}
module.exports = { readInterruptionInput };
