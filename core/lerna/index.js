"use strict";

const cli = require("@0x-lerna-fork/cli");

const addCmd = require("@0x-lerna-fork/add/command");
const bootstrapCmd = require("@0x-lerna-fork/bootstrap/command");
const changedCmd = require("@0x-lerna-fork/changed/command");
const cleanCmd = require("@0x-lerna-fork/clean/command");
const createCmd = require("@0x-lerna-fork/create/command");
const diffCmd = require("@0x-lerna-fork/diff/command");
const execCmd = require("@0x-lerna-fork/exec/command");
const importCmd = require("@0x-lerna-fork/import/command");
const initCmd = require("@0x-lerna-fork/init/command");
const linkCmd = require("@0x-lerna-fork/link/command");
const listCmd = require("@0x-lerna-fork/list/command");
const publishCmd = require("@0x-lerna-fork/publish/command");
const runCmd = require("@0x-lerna-fork/run/command");
const versionCmd = require("@0x-lerna-fork/version/command");

const pkg = require("./package.json");

module.exports = main;

function main(argv) {
  const context = {
    lernaVersion: pkg.version,
  };

  return cli()
    .command(addCmd)
    .command(bootstrapCmd)
    .command(changedCmd)
    .command(cleanCmd)
    .command(createCmd)
    .command(diffCmd)
    .command(execCmd)
    .command(importCmd)
    .command(initCmd)
    .command(linkCmd)
    .command(listCmd)
    .command(publishCmd)
    .command(runCmd)
    .command(versionCmd)
    .parse(argv, context);
}
