#!/usr/bin/env npx zx

// In phase 3, use zx, which was installed in phase 1, change the user's shell to fish

const shellsPath = '/etc/shells';
const fish = (await $`which fish`).stdout.trim();
if ((await nothrow($`grep ${fish} ${shellsPath}`).exitCode) !== 0) {
  await $`echo ${fish} | sudo tee -a ${shellsPath}`;
}

if (process.env.SHELL !== fish) {
  await $`chsh -s ${fish}`;
}
