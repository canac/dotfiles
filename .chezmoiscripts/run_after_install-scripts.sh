#!/bin/bash

# Install all user scripts
deno install --allow-env --allow-net --allow-run=mailbox --unstable -f ~/dev/scripts/feed-watcher.ts
deno install --allow-net --allow-run=mailbox -f ~/dev/scripts/release-watcher.ts

fish -c 'lcman restart chron'
