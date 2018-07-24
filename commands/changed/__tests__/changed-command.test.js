"use strict";

const path = require("path");
const touch = require("touch");

// helpers
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const consoleOutput = require("@0x-lerna-fork/console-output");
const gitAdd = require("@0x-lerna-fork/git-add");
const gitCommit = require("@0x-lerna-fork/git-commit");
const gitTag = require("@0x-lerna-fork/git-tag");
const updateLernaConfig = require("@0x-lerna-fork/update-lerna-config");

// file under test
const lernaChanged = require("@0x-lerna-fork/command-runner")(require("../command"));

const touchFile = cwd => filePath => touch(path.join(cwd, filePath));

const setupGitChanges = async (cwd, filePaths) => {
  await gitTag(cwd, "v1.0.0");
  await Promise.all(filePaths.map(touchFile(cwd)));
  await gitAdd(cwd, "-A");
  await gitCommit(cwd, "Commit");
};

describe("ChangedCommand", () => {
  /** =========================================================================
   * Basic
   * ======================================================================= */

  describe("basic", () => {
    it("should list changes", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-2/random-file"]);
      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list all packages when no tag is found", async () => {
      const testDir = await initFixture("basic");

      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes with --force-publish", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-2/random-file"]);
      await lernaChanged(testDir)("--force-publish");

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes with --force-publish package-2,package-4", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-3/random-file"]);
      await lernaChanged(testDir)("--force-publish", "package-2,package-4");

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes with --force-publish package-2 --force-publish package-4", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-3/random-file"]);
      await lernaChanged(testDir)("--force-publish", "package-2", "--force-publish", "package-4");

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes without ignored files", async () => {
      const testDir = await initFixture("basic");

      await updateLernaConfig(testDir, {
        command: {
          publish: {
            ignoreChanges: ["ignored-file"],
          },
        },
      });

      await setupGitChanges(testDir, ["packages/package-2/ignored-file", "packages/package-3/random-file"]);
      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes in private packages", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-5/random-file"]);
      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should return a non-zero exit code when there are no changes", async () => {
      const testDir = await initFixture("basic");

      await gitTag(testDir, "v1.0.0");
      await lernaChanged(testDir)();

      expect(process.exitCode).toBe(1);

      // reset exit code
      process.exitCode = undefined;
    });
  });

  /** =========================================================================
   * Circular
   * ======================================================================= */

  describe("circular", () => {
    it("should list changes", async () => {
      const testDir = await initFixture("circular");

      await setupGitChanges(testDir, ["packages/package-3/random-file"]);
      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes with --force-publish *", async () => {
      const testDir = await initFixture("circular");

      await setupGitChanges(testDir, ["packages/package-2/random-file"]);
      await lernaChanged(testDir)("--force-publish", "*");

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes with --force-publish package-2", async () => {
      const testDir = await initFixture("circular");

      await setupGitChanges(testDir, ["packages/package-4/random-file"]);
      await lernaChanged(testDir)("--force-publish", "package-2");

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should list changes without ignored files", async () => {
      const testDir = await initFixture("circular");

      await updateLernaConfig(testDir, {
        command: {
          publish: {
            ignore: ["ignored-file"],
          },
        },
      });

      await setupGitChanges(testDir, ["packages/package-2/ignored-file", "packages/package-3/random-file"]);
      await lernaChanged(testDir)();

      expect(consoleOutput()).toMatchSnapshot();
    });

    it("should return a non-zero exit code when there are no changes", async () => {
      const testDir = await initFixture("circular");

      await gitTag(testDir, "v1.0.0");
      await lernaChanged(testDir)();

      expect(process.exitCode).toBe(1);

      // reset exit code
      process.exitCode = undefined;
    });
  });

  /** =========================================================================
   * JSON Output
   * ======================================================================= */

  describe("with --json", () => {
    it("should list changes as a json object", async () => {
      const testDir = await initFixture("basic");

      await setupGitChanges(testDir, ["packages/package-2/random-file"]);
      await lernaChanged(testDir)("--json");

      // Output should be a parseable string
      const jsonOutput = JSON.parse(consoleOutput());
      expect(jsonOutput).toMatchSnapshot();
    });
  });
});
