#!/usr/bin/env fish

# Install teleport
deno install --global --force \
    --allow-env \
    --allow-read \
    --allow-write \
    --allow-run=fzf \
    ~/dev/scripts/teleport.ts
