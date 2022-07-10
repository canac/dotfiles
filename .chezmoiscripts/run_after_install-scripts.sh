#!/bin/bash

# Install all user scripts
deno install --allow-net --allow-run=mailbox -f ~/dev/scripts/release-watcher.ts

fish -c 'lcman restart chron'
