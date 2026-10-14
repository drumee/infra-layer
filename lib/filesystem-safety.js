"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
function fail(code) { throw Object.assign(new Error(code), { code }); }
function directory(root, create = false) {
  if (typeof root !== "string" || !path.isAbsolute(root) || root.split(path.sep).some((part) => part === "." || part === "..") || root === "/") fail("UNSAFE_RESOURCE_PATH");
  let current = "/";
  for (const part of root.split("/").filter(Boolean)) {
    current = path.join(current, part);
    let stat = fs.lstatSync(current, { throwIfNoEntry: false });
    if (!stat && create) { try { fs.mkdirSync(current, { mode: 0o700 }); } catch (error) { if (error.code !== "EEXIST") throw error; } stat = fs.lstatSync(current); }
    if (!stat || !stat.isDirectory() || stat.isSymbolicLink()) fail("UNSAFE_RESOURCE_PATH");
    if (stat.uid !== 0 && stat.uid !== process.getuid()) fail("RESOURCE_OWNERSHIP_MISMATCH");
    if ((stat.mode & 0o022) && !(stat.uid === 0 && (stat.mode & 0o1000))) fail("RESOURCE_PERMISSIONS_UNSAFE");
  }
  return fs.lstatSync(root);
}
function privateDirectory(root, create = false) {
  const stat = directory(root, create);
  if (stat.uid !== process.getuid() || (stat.mode & 0o077)) fail("RESOURCE_PERMISSIONS_UNSAFE");
}
function read(file, private_file = true) {
  directory(path.dirname(file));
  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
  if (!stat) fail("RESOURCE_MISSING");
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) fail("UNSAFE_RESOURCE_PATH");
  if (stat.uid !== process.getuid() || (private_file && (stat.mode & 0o077))) fail("RESOURCE_PERMISSIONS_UNSAFE");
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try { const opened = fs.fstatSync(fd); if (opened.ino !== stat.ino || opened.dev !== stat.dev || opened.nlink !== 1) fail("UNSAFE_RESOURCE_PATH"); return fs.readFileSync(fd); } finally { fs.closeSync(fd); }
}
function atomic(file, content, mode = 0o600, exclusive = false) {
  directory(path.dirname(file));
  const temporary = path.join(path.dirname(file), `.infra-write-${crypto.randomUUID()}`);
  const fd = fs.openSync(temporary, "wx", mode);
  try { fs.writeFileSync(fd, content); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try { const stat = fs.lstatSync(file, { throwIfNoEntry: false }); if (stat && (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)) fail("UNSAFE_RESOURCE_PATH");
    if (exclusive) { try { fs.linkSync(temporary, file); } catch (error) { if (error.code === "EEXIST") fail("SECRET_DESTINATION_OCCUPIED"); throw error; } fs.unlinkSync(temporary); }
    else fs.renameSync(temporary, file);
    const parent = fs.openSync(path.dirname(file), fs.constants.O_RDONLY); try { fs.fsyncSync(parent); } finally { fs.closeSync(parent); } }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
function lock(root, callback) {
  privateDirectory(root);
  const file = path.join(root, ".infra-lifecycle-lock");
  try { fs.mkdirSync(file, { mode: 0o700 }); } catch (error) { if (error.code === "EEXIST") fail("RESOURCE_LOCKED"); throw error; }
  const stat = fs.lstatSync(file);
  try { return callback(); } finally { const current = fs.lstatSync(file, { throwIfNoEntry: false }); if (current && current.ino === stat.ino && current.dev === stat.dev && current.isDirectory() && !current.isSymbolicLink()) fs.rmdirSync(file); }
}
async function lockAsync(root, callback) {
  privateDirectory(root); const file = path.join(root, ".infra-lifecycle-lock");
  try { fs.mkdirSync(file, { mode: 0o700 }); } catch (error) { if (error.code === "EEXIST") fail("RESOURCE_LOCKED"); throw error; }
  const stat = fs.lstatSync(file);
  try { return await callback(); } finally { const current = fs.lstatSync(file, { throwIfNoEntry: false }); if (current && current.ino === stat.ino && current.dev === stat.dev && current.isDirectory() && !current.isSymbolicLink()) fs.rmdirSync(file); }
}
module.exports = { fail, directory, privateDirectory, read, atomic, lock, lockAsync };
