"use strict";

// we're actually testing integration with git
jest.unmock("@0x-lerna-fork/collect-updates");

const path = require("path");
const fs = require("fs");

// mocked modules
const output = require("@0x-lerna-fork/output");

// helpers
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const gitAdd = require("@0x-lerna-fork/git-add");
const gitCommit = require("@0x-lerna-fork/git-commit");
const gitTag = require("@0x-lerna-fork/git-tag");
const gitCheckout = require("@0x-lerna-fork/git-checkout");
const gitMerge = require("@0x-lerna-fork/git-merge");

// file under test
const lernaVersion = require("@0x-lerna-fork/command-runner")(require("../command"));

// remove quotes around top-level strings
expect.addSnapshotSerializer({
  test(val) {
    return typeof val === "string";
  },
  serialize(val, config, indentation, depth) {
    // top-level strings don't need quotes, but nested ones do (object properties, etc)
    return depth ? `"${val}"` : val;
  },
});

// normalize temp directory paths in snapshots
expect.addSnapshotSerializer(require("@0x-lerna-fork/serialize-windows-paths"));
expect.addSnapshotSerializer(require("@0x-lerna-fork/serialize-tempdir"));

describe("version --include-merged-tags", () => {
  const setupGitChangesWithBranch = async (cwd, masterPaths, branchPaths) => {
    await gitTag(cwd, "v1.0.0");
    await Promise.all(masterPaths.map(fp => fs.appendFileSync(path.join(cwd, fp), "1")));
    await gitAdd(cwd, "-A");
    await gitCommit(cwd, "Commit");
    // Create release branch
    await gitCheckout(cwd, ["-b", "release/v1.0.1"]);
    // Switch into release branch
    await Promise.all(branchPaths.map(fp => fs.appendFileSync(path.join(cwd, fp), "1")));
    await gitAdd(cwd, "-A");
    await gitCommit(cwd, "Bump");
    await gitTag(cwd, "v1.0.1");
    await gitCheckout(cwd, ["master"]);
    await gitMerge(cwd, ["--no-ff", "release/v1.0.1"]);
    // Commit after merge
    await Promise.all(masterPaths.map(fp => fs.appendFileSync(path.join(cwd, fp), "1")));
    await gitAdd(cwd, "-A");
    await gitCommit(cwd, "Commit2");
  };

  describe("disabled", () => {
    it("should list changes to package-4", async () => {
      const testDir = await initFixture("basic");

      await setupGitChangesWithBranch(
        testDir,
        ["packages/package-2/random-file"],
        ["packages/package-4/random-file"]
      );
      // Without --include-merged-tags we receive all changes since the last tag on master
      // in this case it's v1.0.0, this includes changes to package-4 which was released
      // in the release branch with v1.0.1
      await lernaVersion(testDir)("--no-git-tag-version");

      expect(output.logged()).toMatchInlineSnapshot(`

Changes:
 - package-2: 1.0.0 => 1.0.1
 - package-3: 1.0.0 => 1.0.1
 - package-4: 1.0.0 => 1.0.1

`);
    });
  });

  describe("enabled", () => {
    it("should not list changes to package-4", async () => {
      const testDir = await initFixture("basic");

      await setupGitChangesWithBranch(
        testDir,
        ["packages/package-2/random-file"],
        ["packages/package-4/random-file"]
      );
      // With --include-merged-tags we correctly detect that v1.0.1 was already tagged
      // and merged. We no longer want to receive package-4.
      await lernaVersion(testDir)("--no-git-tag-version", "--include-merged-tags");

      expect(output.logged()).toMatchInlineSnapshot(`

Changes:
 - package-2: 1.0.0 => 1.0.1
 - package-3: 1.0.0 => 1.0.1

`);
    });
  });
});
