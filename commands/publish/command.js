"use strict";

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "publish";

exports.describe = "Publish packages in the current project.";

exports.builder = yargs => {
  const cdVersionOptions = ["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"];
  const cdVersionOptionString = `'${cdVersionOptions.slice(0, -1).join("', '")}', or '${
    cdVersionOptions[cdVersionOptions.length - 1]
  }'.`;

  // TODO: share only relevant options with `lerna changed`
  const opts = {
    "allow-branch": {
      describe: "Specify which branches to allow publishing from.",
      type: "array",
    },
    canary: {
      defaultDescription: "alpha",
      describe: "Publish packages after every successful merge using the sha as part of the tag.",
      alias: "c",
      // NOTE: this type must remain undefined, as it is too overloaded to make sense
      // type: "string",
    },
    "cd-version": {
      describe: `Skip the version selection prompt and increment semver: ${cdVersionOptionString}`,
      type: "string",
      requiresArg: true,
      coerce: choice => {
        if (cdVersionOptions.indexOf(choice) === -1) {
          throw new Error(`--cd-version must be one of: ${cdVersionOptionString}`);
        }
        return choice;
      },
    },
    "cd-versions": {
      describe: `Supply multiple package semvers: ${cdVersionOptionString}`,
      type: "string",
      requiresArg: true,
      coerce: choice => {
        const errMsg =
          "--cd-versions must contain a string of format: package-1@1.3.2,package-2@2.3.4,package@3.2.1";
        if (choice.indexOf(",") === -1) {
          throw new Error(errMsg);
        }
        const packages = choice.split(",");
        for (const pkg of packages) {
          if (pkg.indexOf("@") === -1) {
            throw new Error(errMsg);
          }
          // TODO:
          // Check that there is only 1 '@' sign
          // Check that to the right of the '@' sign, there are proper semvers
          // and to the left a valid package name
        }
        return choice;
      },
    },
    "conventional-commits": {
      describe: "Use angular conventional-commit format to determine version bump and generate CHANGELOG.",
      type: "boolean",
      default: undefined,
    },
    "changelog-preset": {
      describe: "Use another conventional-changelog preset rather than angular.",
      type: "string",
      default: undefined,
    },
    exact: {
      describe: "Specify cross-dependency version numbers exactly rather than with a caret (^).",
      type: "boolean",
      default: undefined,
    },
    "git-remote": {
      defaultDescription: "origin",
      describe: "Push git changes to the specified remote instead of 'origin'.",
      type: "string",
      requiresArg: true,
    },
    "ignore-changes": {
      describe: "Ignore changes in files matched by glob(s).",
      type: "array",
    },
    message: {
      describe: "Use a custom commit message when creating the publish commit.",
      alias: "m",
      type: "string",
      requiresArg: true,
    },
    "npm-tag": {
      describe: "Publish packages with the specified npm dist-tag",
      type: "string",
      requiresArg: true,
    },
    "npm-client": {
      describe: "Executable used to publish dependencies (npm, yarn, pnpm, ...)",
      type: "string",
      requiresArg: true,
    },
    registry: {
      describe: "Use the specified registry for all npm client operations.",
      type: "string",
      requiresArg: true,
    },
    preid: {
      describe: "Specify the prerelease identifier (major.minor.patch-pre).",
      type: "string",
      requiresArg: true,
    },
    "repo-version": {
      describe: "Specify repo version to publish.",
      type: "string",
      requiresArg: true,
    },
    "skip-git": {
      describe: "Skip commiting, tagging, and pushing git changes.",
      type: "boolean",
      default: undefined,
    },
    "skip-npm": {
      describe: "Stop before actually publishing change to npm.",
      type: "boolean",
      default: undefined,
    },
    "temp-tag": {
      describe: "Create a temporary tag while publishing.",
      type: "boolean",
      default: undefined,
    },
    yes: {
      describe: "Skip all confirmation prompts.",
      type: "boolean",
      default: undefined,
    },
  };

  return yargs
    .options(opts)
    .group(Object.keys(opts), "Command Options:")
    .option("ignore", {
      // NOT the same as filter-options --ignore
      hidden: true,
      conflicts: "ignore-changes",
      type: "array",
    })
    .check(argv => {
      if (argv.ignore) {
        /* eslint-disable no-param-reassign */
        argv.ignoreChanges = argv.ignore;
        delete argv.ignore;
        /* eslint-enable no-param-reassign */
      }

      return argv;
    });
};

exports.handler = function handler(argv) {
  return require(".")(argv);
};
