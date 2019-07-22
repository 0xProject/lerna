"use strict";

const fetch = require("@evocateur/npm-registry-fetch");
const pulseTillDone = require("@0x-lerna-fork/pulse-till-done");

module.exports = getProfileData;

function getProfileData(opts) {
  opts.log.verbose("", "Retrieving npm user profile");

  return pulseTillDone(fetch.json("/-/npm/v1/user", opts)).then(data => {
    opts.log.silly("npm profile get", "received %j", data);

    return Object.assign(
      // remap to match legacy whoami format
      { username: data.name },
      data
    );
  });
}
