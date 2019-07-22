"use strict";

const log = require("npmlog");
const childProcess = require("@0x-lerna-fork/child-process");

module.exports = getCurrentSHA;

function getCurrentSHA(opts) {
  log.silly("getCurrentSHA");

  const sha = childProcess.execSync("git", ["rev-parse", "HEAD"], opts);
  log.verbose("getCurrentSHA", sha);

  return sha;
}
