#!/usr/bin/env bash

# Install feed-watcher
deno install --global --force \
  --allow-net=mailbox-proxy.canac.deno.net \
  --allow-run=mailbox \
  "$HOME/dev/scripts/mailbox-proxy.ts"
