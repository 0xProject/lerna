"use strict";

const log = require("npmlog");
const ChildProcessUtilities = require("@0x-lerna-fork/child-process");

module.exports = warnIfHanging;

function warnIfHanging() {
  const childProcessCount = ChildProcessUtilities.getChildProcessCount();

  if (childProcessCount > 0) {
    log.warn(
      "complete",
      `Waiting for ${childProcessCount} child ` +
        `process${childProcessCount === 1 ? "" : "es"} to exit. ` +
        "CTRL-C to exit immediately."
    );
  }
}
