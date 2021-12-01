#!/usr/bin/env -S npx zx

// In phase 2, use zx, which was installed in phase 1, to configure installed packages because it
// is a nicer scripting language than bash

// Configure fzf
await $`$(brew --prefix fzf)/install --key-bindings --no-completion --no-update-rc --no-bash --no-zsh`;

// Configure nextdns
if ((await $`sudo nextdns status`) !== 'running') {
  await $`sudo nextdns install --config 1d7724 -report-client-info -auto-activate`;
}

// Change the shell to fish
const shellsPath = '/etc/shells';
const fish = (await $`which fish`).stdout.trim();
if ((await nothrow($`grep ${fish} ${shellsPath}`).exitCode) !== 0) {
  await $`echo ${fish} | sudo tee -a ${shellsPath}`;
}

if (process.env.SHELL !== fish) {
  await $`chsh -s ${fish}`;
}
