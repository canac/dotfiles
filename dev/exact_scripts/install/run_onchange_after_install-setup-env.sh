#!/usr/bin/env bash

# Install setup-env
deno install --global --force \
  --allow-read \
  --allow-write \
  --allow-env \
  --allow-run=fish,ensure-lines,git,mise \
  "$HOME/dev/scripts/setup-env.ts"
