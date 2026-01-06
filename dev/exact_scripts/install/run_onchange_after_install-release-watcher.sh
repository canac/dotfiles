#!/usr/bin/env bash

# Install release-watcher
deno install --global --force \
  --allow-read="$HOME/.local/share/canac/" \
  --allow-write="$HOME/.local/share/canac/" \
  --allow-env=HOME \
  --allow-net \
  --allow-run=mailbox \
  "$HOME/dev/scripts/release-watcher.ts"
