"use strict";

module.exports = {
  bail: true,
  modulePathIgnorePatterns: ["/__fixtures__/"],
  roots: ["<rootDir>/integration"],
  setupFiles: ["@0x-lerna-fork/set-npm-userconfig"],
  setupFilesAfterEnv: ["<rootDir>/setup-integration-timeout.js"],
  snapshotSerializers: ["@0x-lerna-fork/serialize-placeholders"],
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
  verbose: true,
};
