# `@0x-lerna-fork/rimraf-dir`

> Run rimraf on a directory in a subprocess to hack around slowness

## Usage

```js
const rimrafDir = require("@0x-lerna-fork/rimraf-dir");

rimrafDir("/path/to/directory").then(removedDir => {
  console.log("removed", removedDir);
});
```

Install [lerna](https://www.npmjs.com/package/lerna) for access to the `lerna` CLI.
