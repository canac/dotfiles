#!/usr/bin/env fish

# Install feed-watcher
deno install --global --force \
    --allow-read=$HOME/.local/share/canac/ \
    --allow-write=$HOME/.local/share/canac/ \
    --allow-env=HOME \
    --allow-net \
    --allow-run=mailbox \
    ~/dev/scripts/feed-watcher.ts
