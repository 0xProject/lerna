"use strict";

const log = require("npmlog");
const childProcess = require("@0x-lerna-fork/child-process");

module.exports = gitTag;

function gitTag(tag, opts) {
  log.silly("gitTag", tag);

  return childProcess.exec("git", ["tag", tag, "-m", tag], opts);
}
