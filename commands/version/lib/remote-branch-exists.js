"use strict";

const log = require("npmlog");
const childProcess = require("@0x-lerna-fork/child-process");

module.exports = remoteBranchExists;

function remoteBranchExists(gitRemote, branch, opts) {
  log.silly("remoteBranchExists");

  const remoteBranch = `${gitRemote}/${branch}`;

  try {
    childProcess.execSync("git", ["show-ref", "--verify", `refs/remotes/${remoteBranch}`], opts);
    return true;
  } catch (e) {
    return false;
  }
}
