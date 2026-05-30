#!/usr/bin/env fish

# Install git-work
deno install --global --force \
    --allow-read \
    --allow-write \
    --allow-env \
    --allow-run \
    ~/dev/scripts/git-work.ts
