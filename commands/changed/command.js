"use strict";

const versionOptions = require("@0x-lerna-fork/version/command").builder;
const listable = require("@0x-lerna-fork/listable");

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "changed";

exports.aliases = ["updated"];

exports.describe = "List local packages that have changed since the last tagged release";

exports.builder = yargs => {
  listable.options(yargs);

  return versionOptions(yargs, "changed");
};

exports.handler = function handler(argv) {
  return require(".")(argv);
};
