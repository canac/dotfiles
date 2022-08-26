#!/bin/bash

# Install all user scripts
deno install --allow-read=$HOME/.local/share/canac/ --allow-write=$HOME/.local/share/canac/ --allow-env=HOME --allow-net --allow-run=mailbox -f ~/dev/scripts/feed-watcher.ts
deno install --allow-read=$HOME/.local/share/canac/ --allow-write=$HOME/.local/share/canac/ --allow-env=HOME --allow-net --allow-run=mailbox -f ~/dev/scripts/release-watcher.ts

fish -c 'lcman restart chron'
