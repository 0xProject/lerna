"use strict";

const cliRunner = require("@0x-lerna-fork/cli-runner");
const initFixture = require("@0x-lerna-fork/init-fixture")(__dirname);
const loadManifests = require("@0x-lerna-fork/load-manifests");

describe("lerna import", () => {
  test("works with argument provided", async () => {
    const [externalPath, cwd] = await Promise.all([
      initFixture("lerna-import-external", "Init external commit"),
      initFixture("lerna-import"),
    ]);

    await cliRunner(cwd)("import", externalPath, "--yes");

    const allPackageJsons = await loadManifests(cwd);
    expect(allPackageJsons).toMatchInlineSnapshot(`
Array [
  Object {
    "//": "Import should use _directory_ name, not package name",
    "name": "external-name",
  },
]
`);
  });
});
