"use strict";

jest.mock("@0x-lerna-fork/create-symlink");

// mocked or stubbed modules
const createSymlink = require("@0x-lerna-fork/create-symlink");

// helpers
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const normalizeRelativeDir = require("@0x-lerna-fork/normalize-relative-dir");

// file under test
const lernaLink = require("@0x-lerna-fork/command-runner")(require("../command"));

// assertion helpers
const symlinkedDirectories = testDir =>
  createSymlink.mock.calls
    .slice()
    // ensure sort is always consistent, despite promise variability
    .sort((a, b) => (b[0] === a[0] ? b[1] < a[1] : b[0] < a[0]))
    .map(([src, dest, type]) => ({
      _src: normalizeRelativeDir(testDir, src),
      dest: normalizeRelativeDir(testDir, dest),
      type,
    }));

describe("LinkCommand", () => {
  // the underlying implementation of symlinkDependencies
  createSymlink.mockResolvedValue();

  describe("with local package dependencies", () => {
    it("should symlink all packages", async () => {
      const testDir = await initFixture("basic");
      await lernaLink(testDir)();

      expect(symlinkedDirectories(testDir)).toMatchSnapshot();
    });
  });

  describe("with --force-local", () => {
    it("should force symlink of all packages", async () => {
      const testDir = await initFixture("force-local");
      await lernaLink(testDir)();

      expect(symlinkedDirectories(testDir)).toMatchSnapshot();
    });
  });
});
