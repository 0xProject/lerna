"use strict";

const ChildProcessUtilities = require("@0x-lerna-fork/child-process");

module.exports = getLatestVersion;

// istanbul ignore next
function getLatestVersion(depName, execOpts) {
  // TODO: use pacote.manifest() instead
  return ChildProcessUtilities.execSync("npm", ["info", depName, "version"], execOpts);
}
