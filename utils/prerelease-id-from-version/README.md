# `@0x-lerna-fork/prerelease-id-from-version`

> Get the prerelease ID from a version string

## Usage

```js
const prereleaseIdFromVersion = require("@0x-lerna-fork/prerelease-id-from-version");

prereleaseIdFromVersion(1.0.0-alpha.0); // => "alpha"

prereleaseIdFromVersion(1.0.0); // => undefined

prereleaseIdFromVersion(); // => undefined
```

Install [lerna](https://www.npmjs.com/package/lerna) for access to the `lerna` CLI.
