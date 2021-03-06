#!/usr/bin/env -S npx zx

// In phase 2, use zx, which was installed in phase 1, to install npm packages because it
// is a nicer scripting language than bash

const needed =
  'jay-repl nodemon npm-check npm-run npm trash-cli typescript yarn';
const output = await $`npm ls -g --json`;
const installed = new Set(Object.keys(JSON.parse(output).dependencies));
const notInstalled = needed.split(' ').filter((dep) => !installed.has(dep));
if (notInstalled.length > 0) {
  await $`npm install -g ${notInstalled}`;
}
