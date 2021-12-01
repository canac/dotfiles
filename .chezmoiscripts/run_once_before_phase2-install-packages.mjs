#!/usr/bin/env -S npx zx

// In phase 2, use zx, which was installed in phase 1, to install npm and pipx packages because it
// is a nicer scripting language than bash

const npmNeeded =
  'jay-repl nodemon npm-check npm-run npm trash-cli typescript yarn';
const pipxNeeded = 'copier';

{
  const output = await $`npm ls -g --json`;
  const installed = new Set(Object.keys(JSON.parse(output).dependencies));
  const notInstalled = npmNeeded
    .split(' ')
    .filter((dep) => !installed.has(dep));
  if (notInstalled.length > 0) {
    await $`npm install -g ${notInstalled}`;
  }
}

{
  // Only use stdout because non-json errors can be printed to stderr, like when no packages are installed
  const output = (await $`pipx list --json`).stdout;
  const installed = new Set(Object.keys(JSON.parse(output).venvs));
  const notInstalled = pipxNeeded
    .split(' ')
    .filter((dep) => !installed.has(dep));
  if (notInstalled.length > 0) {
    await $`pipx install ${notInstalled}`;
  }
}
