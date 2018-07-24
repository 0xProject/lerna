"use strict";

const execa = require("execa");
const gitSHA = require("@0x-lerna-fork/serialize-git-sha");

module.exports = showCommit;

function showCommit(cwd, ...args) {
  return execa
    .stdout("git", ["show", "--unified=0", "--ignore-space-at-eol", "--pretty=%B%+D", ...args], { cwd })
    .then(stdout => gitSHA.serialize(stdout));
}
