"use strict";

const log = require("npmlog");
const childProcess = require("@0x-lerna-fork/child-process");

module.exports = gitCheckout;

function gitCheckout(fileGlob, opts) {
  log.silly("gitCheckout", fileGlob);

  return childProcess.exec("git", ["checkout", "--", fileGlob], opts);
}
