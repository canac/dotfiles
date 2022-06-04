#!/bin/bash

# Install all user scripts
deno install --allow-env=HOME,PORT --allow-net=0.0.0.0:$PORT --allow-run --allow-read=$HOME/.local/share/chron,$HOME/.config/chron/chronfile.toml --allow-write=$HOME/.local/share/chron --name chron --force https://denopkg.com/canac/chron-deno@0.1.0/main.ts
deno install --allow-env=CHRON_MAILBOX_URL,HOME --allow-net -f ~/dev/scripts/release-watcher.ts

fish -c 'lcman restart chron'
