"use strict";

const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const getCurrentBranch = require("../lib/get-current-branch");

test("getCurrentBranch", async () => {
  const cwd = await initFixture("root-manifest-only");

  expect(getCurrentBranch({ cwd })).toBe("master");
});
