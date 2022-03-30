#!/bin/bash

# Install all user scripts
cargo install --git https://github.com/canac/chron.git
deno install --allow-env=CHRON_MAILBOX_URL,HOME --allow-net -f ~/dev/scripts/release-watcher.ts
