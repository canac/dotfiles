#!/usr/bin/env fish

# Install setup-env
deno install --global --force \
    --allow-read \
    --allow-write \
    --allow-env \
    --allow-run=fish,ensure-lines,git,mise \
    ~/dev/scripts/setup-env.ts
