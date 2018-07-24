"use strict";

module.exports = {
  clearMocks: true,
  collectCoverageFrom: ["{commands,core,utils}/**/*.js", "!commands/create/lerna-module-data.js"],
  modulePathIgnorePatterns: ["/__fixtures__/"],
  roots: ["<rootDir>/commands", "<rootDir>/core", "<rootDir>/utils"],
  setupFiles: ["@0x-lerna-fork/silence-logging", "@0x-lerna-fork/set-npm-userconfig"],
  testEnvironment: "node",
};
