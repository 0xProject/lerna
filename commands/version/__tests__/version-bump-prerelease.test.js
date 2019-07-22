"use strict";

// we're actually testing integration with git
jest.unmock("@0x-lerna-fork/collect-updates");
jest.unmock("@0x-lerna-fork/conventional-commits");

// local modules _must_ be explicitly mocked
jest.mock("../lib/git-push");
jest.mock("../lib/is-anything-committed");
jest.mock("../lib/is-behind-upstream");
jest.mock("../lib/remote-branch-exists");

const fs = require("fs-extra");
const path = require("path");

// mocked modules
const prompt = require("@0x-lerna-fork/prompt");

// helpers
const initFixture = require("@0x-lerna-fork/init-fixture")(path.resolve(__dirname, "../../publish/__tests__"));
const showCommit = require("@0x-lerna-fork/show-commit");
const gitInit = require("@0x-lerna-fork/git-init");
const gitAdd = require("@0x-lerna-fork/git-add");
const gitTag = require("@0x-lerna-fork/git-tag");
const gitCommit = require("@0x-lerna-fork/git-commit");
const getCommitMessage = require("@0x-lerna-fork/get-commit-message");
const Tacks = require("tacks");
const tempy = require("tempy");

const { File, Dir } = Tacks;

// test command
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

// stabilize commit SHA
expect.addSnapshotSerializer(require("@0x-lerna-fork/serialize-changelog"));

const setupChanges = async cwd => {
  await gitTag(cwd, "v1.0.1-beta.3");
  await fs.outputFile(path.join(cwd, "packages/package-3/hello.js"), "world");
  await gitAdd(cwd, ".");
  await gitCommit(cwd, "feat: setup");
};

test("version patch with previous prerelease also graduates prereleased", async () => {
  const testDir = await initFixture("republish-prereleased");
  // should republish 3, 4, and 5 because:
  // package 3 changed
  // package 5 has a prerelease version
  // package 4 depends on package 5

  await setupChanges(testDir);
  await lernaVersion(testDir)("patch");

  const patch = await showCommit(testDir);
  expect(patch).toMatchSnapshot();
});

test("version prerelease with previous prerelease bumps changed only", async () => {
  const testDir = await initFixture("republish-prereleased");
  // should republish only package 3, because only it changed

  await setupChanges(testDir);
  await lernaVersion(testDir)("prerelease");

  const patch = await showCommit(testDir);
  expect(patch).toMatchSnapshot();
});

test("version prerelease with previous prerelease supersedes --conventional-commits", async () => {
  const testDir = await initFixture("republish-prereleased");
  // version bump should stay prepatch --preid beta because ---conventional-commits is ignored

  await setupChanges(testDir);
  await lernaVersion(testDir)("prerelease", "--conventional-commits");

  const patch = await showCommit(testDir);
  expect(patch).toMatchSnapshot();
});

test("version prerelease with existing preid bumps with the preid provide as argument", async () => {
  const testDir = await initFixture("republish-prereleased");
  // Version bump should have the new rc preid
  await setupChanges(testDir);
  await lernaVersion(testDir)("prerelease", "--preid", "rc");

  const message = await getCommitMessage(testDir);
  expect(message).toBe("v1.0.1-rc.0");
});

test("version prerelease with immediate graduation", async () => {
  const testDir = await initFixture("republish-prereleased");

  await setupChanges(testDir);
  await lernaVersion(testDir)("prerelease", "--force-publish", "package-4");
  // package-4 had no changes, but should still be included for some mysterious reason

  const firstDiff = await showCommit(testDir);
  expect(firstDiff).toMatchSnapshot();

  // no changes, but force everything because the previous prerelease passed QA
  await lernaVersion(testDir)("patch", "--force-publish");

  const secondDiff = await showCommit(testDir);
  expect(secondDiff).toMatchSnapshot();
});

test("independent version prerelease does not bump on every unrelated change", async () => {
  const cwd = tempy.directory();
  const fixture = new Tacks(
    Dir({
      "lerna.json": File({
        version: "independent",
      }),
      "package.json": File({
        name: "unrelated-bumps",
      }),
      packages: Dir({
        "pkg-a": Dir({
          "package.json": File({
            name: "pkg-a",
            version: "1.0.0",
          }),
        }),
        "pkg-b": Dir({
          "package.json": File({
            name: "pkg-b",
            version: "1.0.0-bumps.1",
          }),
        }),
      }),
    })
  );

  fixture.create(cwd);

  await gitInit(cwd, ".");
  await gitAdd(cwd, "-A");
  await gitCommit(cwd, "init");

  // simulate choices for pkg-a then pkg-b
  prompt.mockChoices("patch", "PRERELEASE");
  prompt.input.mockImplementationOnce((msg, cfg) =>
    // the _existing_ "bumps" prerelease ID should be preserved
    Promise.resolve(cfg.filter())
  );

  await lernaVersion(cwd)();

  const first = await getCommitMessage(cwd);
  expect(first).toMatchInlineSnapshot(`
Publish

 - pkg-a@1.0.1
 - pkg-b@1.0.0-bumps.2
`);

  await fs.outputFile(path.join(cwd, "packages/pkg-a/hello.js"), "world");
  await gitAdd(cwd, ".");
  await gitCommit(cwd, "feat: hello world");

  // all of this just to say...
  await lernaVersion(cwd)();

  const second = await getCommitMessage(cwd);
  expect(second).toMatchInlineSnapshot(`
Publish

 - pkg-a@1.0.2
`);
});
