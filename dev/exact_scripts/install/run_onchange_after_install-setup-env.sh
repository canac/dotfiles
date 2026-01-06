#!/usr/bin/env bash

# Install setup-env
deno install --global --force \
  --allow-read \
  --allow-write \
  --allow-env \
  --allow-run=bash,git,mise \
  "$HOME/dev/scripts/setup-env.ts"
