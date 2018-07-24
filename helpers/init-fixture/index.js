"use strict";

const tempy = require("tempy");
const copyFixture = require("@0x-lerna-fork/copy-fixture");
const gitAdd = require("@0x-lerna-fork/git-add");
const gitCommit = require("@0x-lerna-fork/git-commit");
const gitInit = require("@0x-lerna-fork/git-init");

module.exports = initFixture;

function initFixture(startDir) {
  return (fixtureName, commitMessage = "Init commit") => {
    const cwd = tempy.directory();

    return Promise.resolve()
      .then(() => process.chdir(cwd))
      .then(() => copyFixture(cwd, fixtureName, startDir))
      .then(() => gitInit(cwd, "."))
      .then(() => gitAdd(cwd, "-A"))
      .then(() => gitCommit(cwd, commitMessage))
      .then(() => cwd);
  };
}
