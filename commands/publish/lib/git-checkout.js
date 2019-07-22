"use strict";

const log = require("npmlog");
const childProcess = require("@0x-lerna-fork/child-process");

module.exports = gitCheckout;

function gitCheckout(files, opts) {
  log.silly("gitCheckout", files);

  return childProcess.exec("git", ["checkout", "--"].concat(files), opts);
}
