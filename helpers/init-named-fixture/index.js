"use strict";

const path = require("path");
const fs = require("fs-extra");
const tempy = require("tempy");
const copyFixture = require("@0x-lerna-fork/copy-fixture");
const gitAdd = require("@0x-lerna-fork/git-add");
const gitCommit = require("@0x-lerna-fork/git-commit");
const gitInit = require("@0x-lerna-fork/git-init");

module.exports = initNamedFixture;

function initNamedFixture(startDir) {
  return (dirName, fixtureName, commitMessage = "Init commit") => {
    const cwd = path.join(tempy.directory(), dirName);
    let chain = Promise.resolve();

    chain = chain.then(() => fs.ensureDir(cwd));
    chain = chain.then(() => process.chdir(cwd));
    chain = chain.then(() => copyFixture(cwd, fixtureName, startDir));
    chain = chain.then(() => gitInit(cwd, "."));

    if (commitMessage) {
      chain = chain.then(() => gitAdd(cwd, "-A"));
      chain = chain.then(() => gitCommit(cwd, commitMessage));
    }

    return chain.then(() => cwd);
  };
}
