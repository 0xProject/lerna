"use strict";

// local modules _must_ be explicitly mocked
jest.mock("../lib/get-packages-without-license");
jest.mock("../lib/verify-npm-package-access");
jest.mock("../lib/get-npm-username");
jest.mock("../lib/get-two-factor-auth-required");
jest.mock("../lib/get-unpublished-packages");
// FIXME: better mock for version command
jest.mock("../../version/lib/git-push");
jest.mock("../../version/lib/is-anything-committed");
jest.mock("../../version/lib/is-behind-upstream");
jest.mock("../../version/lib/remote-branch-exists");

// mocked or stubbed modules
const npmPublish = require("@0x-lerna-fork/npm-publish");
const PromptUtilities = require("@0x-lerna-fork/prompt");
const output = require("@0x-lerna-fork/output");
const checkWorkingTree = require("@0x-lerna-fork/check-working-tree");

// helpers
const loggingOutput = require("@0x-lerna-fork/logging-output");
const gitTag = require("@0x-lerna-fork/git-tag");
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);

// file under test
const lernaPublish = require("@0x-lerna-fork/command-runner")(require("../command"));

expect.extend(require("@0x-lerna-fork/figgy-pudding-matchers"));

describe("publish from-git", () => {
  it("publishes tagged packages", async () => {
    const cwd = await initFixture("normal");

    await gitTag(cwd, "v1.0.0");
    await lernaPublish(cwd)("from-git");

    // called from chained describeRef()
    expect(checkWorkingTree.throwIfUncommitted).toHaveBeenCalled();

    expect(PromptUtilities.confirm).toHaveBeenLastCalledWith(
      "Are you sure you want to publish these packages?"
    );
    expect(output.logged()).toMatch("Found 4 packages to publish:");
    expect(npmPublish.order()).toEqual([
      "package-1",
      "package-3",
      "package-4",
      "package-2",
      // package-5 is private
    ]);
  });

  it("publishes tagged independent packages", async () => {
    const cwd = await initFixture("independent");

    await Promise.all([
      gitTag(cwd, "package-1@1.0.0"),
      gitTag(cwd, "package-2@2.0.0"),
      gitTag(cwd, "package-3@3.0.0"),
      gitTag(cwd, "package-4@4.0.0"),
      gitTag(cwd, "package-5@5.0.0"),
    ]);
    await lernaPublish(cwd)("from-git");

    expect(npmPublish.order()).toEqual([
      "package-1",
      "package-3",
      "package-4",
      "package-2",
      // package-5 is private
    ]);
  });

  it("only publishes independent packages with matching tags", async () => {
    const cwd = await initFixture("independent");

    await gitTag(cwd, "package-3@3.0.0");
    await lernaPublish(cwd)("from-git");

    expect(output.logged()).toMatch("Found 1 package to publish:");
    expect(npmPublish.order()).toEqual(["package-3"]);
  });

  it("exits early when the current commit is not tagged", async () => {
    const cwd = await initFixture("normal");

    await lernaPublish(cwd)("from-git");

    expect(npmPublish).not.toHaveBeenCalled();

    const logMessages = loggingOutput("info");
    expect(logMessages).toContain("No tagged release found");
  });

  it("throws an error when uncommitted changes are present", async () => {
    checkWorkingTree.throwIfUncommitted.mockImplementationOnce(() => {
      throw new Error("uncommitted");
    });

    const cwd = await initFixture("normal");

    try {
      await lernaPublish(cwd)("from-git");
    } catch (err) {
      expect(err.message).toBe("uncommitted");
      // notably different than the actual message, but good enough here
    }

    expect.assertions(1);
  });

  it("throws an error when --git-head is passed", async () => {
    const cwd = await initFixture("normal");

    try {
      await lernaPublish(cwd)("from-git", "--git-head", "deadbeef");
    } catch (err) {
      expect(err.prefix).toBe("EGITHEAD");
    }

    expect.hasAssertions();
  });
});
