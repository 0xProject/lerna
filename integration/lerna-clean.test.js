"use strict";

const globby = require("globby");

const cliRunner = require("@0x-lerna-fork/cli-runner");
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const normalizeTestRoot = require("@0x-lerna-fork/normalize-test-root");

describe("lerna clean", () => {
  test("global", async () => {
    const cwd = await initFixture("lerna-clean");
    const args = ["clean", "--yes", "--concurrency=1"];

    const { stderr } = await cliRunner(cwd)(...args);
    expect(normalizeTestRoot(cwd)(stderr)).toMatchSnapshot("stderr");

    const found = await globby(["package-*/node_modules"], { cwd, onlyDirectories: true });
    expect(found).toEqual([]);
  });
});
