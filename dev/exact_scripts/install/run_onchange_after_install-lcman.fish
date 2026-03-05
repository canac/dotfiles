#!/usr/bin/env fish

# Install lcman
deno install --global --force \
    --allow-env \
    --allow-read \
    --allow-run=launchctl,tail,plutil \
    --allow-sys=uid \
    ~/dev/scripts/lcman.ts
