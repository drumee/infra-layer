"use strict";
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process"), { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const source = path.resolve(__dirname, "../.."), archive = path.resolve(process.argv[2]);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-il514-nodemailer-lock-")); fs.chmodSync(root, 0o700);
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex"), commands = [];
function npm(cwd, args, cache = path.join(root, "cache")) {
  const result = spawnSync(trustedExecutable("npm"), [...args, "--cache", cache], { cwd, encoding: "utf8", timeout: 120000, env: trustedEnvironment() });
  commands.push({ args, cwd: path.relative(root, cwd), exit_status: result.status, signal: result.signal });
  return result;
}
function successful(result) { assert.equal(result.status, 0, result.stderr); assert.equal(result.signal, null); }
function identity(directory) {
  const modules = path.join(directory, "node_modules"), files = {};
  function visit(current) {
    for (const name of fs.readdirSync(current).sort()) {
      const file = path.join(current, name), key = path.relative(modules, file), stat = fs.lstatSync(file);
      if (key === ".package-lock.json") continue;
      if (stat.isSymbolicLink()) { assert.ok(fs.realpathSync(file).startsWith(modules + path.sep)); files[key] = { link: fs.readlinkSync(file) }; }
      else if (stat.isDirectory()) visit(file);
      else files[key] = { sha256: digest(fs.readFileSync(file)) };
    }
  }
  visit(modules);
  const lock = JSON.parse(fs.readFileSync(path.join(directory, "package-lock.json"))), graph = {};
  for (const [location, item] of Object.entries(lock.packages)) {
    if (!location || !fs.existsSync(path.join(directory, location, "package.json"))) continue;
    const installed = JSON.parse(fs.readFileSync(path.join(directory, location, "package.json")));
    assert.equal(installed.version, item.version); assert.match(item.resolved, /^https:\/\/registry\.npmjs\.org\//); assert.match(item.integrity, /^sha512-/);
    graph[location] = { name: installed.name, version: installed.version, integrity: item.integrity };
  }
  return { graph, file_entries: Object.keys(files).length, files_sha256: digest(JSON.stringify(files)) };
}
try {
  const identities = [];
  for (const name of ["clean", "cached"]) {
    const directory = path.join(root, name); fs.mkdirSync(directory);
    for (const file of ["package.json", "package-lock.json"]) fs.copyFileSync(path.join(source, file), path.join(directory, file));
    successful(npm(directory, ["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--registry=https://registry.npmjs.org"]));
    successful(npm(directory, ["ls", "--all", "--json"])); identities.push(identity(directory));
  }
  assert.deepEqual(identities[0], identities[1]);
  assert.equal(identities[0].graph["node_modules/nodemailer"].version, "10.1.7");
  assert.equal(identities[0].graph["node_modules/smtp-server/node_modules/nodemailer"].version, "10.1.4");
  const positive = path.join(root, "valid-archive"); fs.mkdirSync(positive);
  fs.writeFileSync(path.join(positive, "package.json"), JSON.stringify({ name: "il514-integrity-fixture", version: "1.0.0", private: true, dependencies: { nodemailer: "file:" + archive } }));
  successful(npm(positive, ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]));
  const lock = JSON.parse(fs.readFileSync(path.join(positive, "package-lock.json"))), approved = lock.packages["node_modules/nodemailer"].integrity;
  assert.equal(approved, "sha512-" + crypto.createHash("sha512").update(fs.readFileSync(archive)).digest("base64"));
  successful(npm(positive, ["ci", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"]));
  assert.equal(JSON.parse(fs.readFileSync(path.join(positive, "node_modules/nodemailer/package.json"))).version, "10.1.7");
  const negative = path.join(root, "invalid-integrity"); fs.mkdirSync(negative);
  fs.copyFileSync(path.join(positive, "package.json"), path.join(negative, "package.json"));
  lock.packages["node_modules/nodemailer"].integrity = "sha512-" + Buffer.alloc(64).toString("base64");
  fs.writeFileSync(path.join(negative, "package-lock.json"), JSON.stringify(lock)); fs.writeFileSync(path.join(negative, "sentinel"), "unchanged");
  const rejected = npm(negative, ["ci", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], path.join(root, "negative-cache"));
  assert.notEqual(rejected.status, 0); assert.equal(rejected.signal, null); assert.match(rejected.stderr, /EINTEGRITY/);
  assert.equal(fs.existsSync(path.join(negative, "node_modules/nodemailer/package.json")), false); assert.equal(fs.readFileSync(path.join(negative, "sentinel"), "utf8"), "unchanged");
  assert.equal(approved, "sha512-" + crypto.createHash("sha512").update(fs.readFileSync(archive)).digest("base64"));
  console.log(JSON.stringify({ source_commit: spawnSync(trustedExecutable("git"), ["rev-parse", "HEAD"], { cwd: source, encoding: "utf8", env: trustedEnvironment() }).stdout.trim(), manifest_sha256: digest(fs.readFileSync(path.join(source, "package.json"))), lock_sha256: digest(fs.readFileSync(path.join(source, "package-lock.json"))), identical_installations: true, ...identities[0], approved_integrity: approved, valid_archive_exit: 0, invalid_integrity_exit: rejected.status, diagnostic: "EINTEGRITY", invalid_integrity_stderr: rejected.stderr, commands }, null, 2));
} finally { fs.rmSync(root, { recursive: true, force: true }); }
