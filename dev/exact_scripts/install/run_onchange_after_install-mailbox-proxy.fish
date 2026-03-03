#!/usr/bin/env fish

# Install mailbox-proxy
deno install --global --force \
    --allow-env=PORT \
    --allow-net=0.0.0.0 \
    --allow-run=mailbox \
    ~/dev/scripts/mailbox-proxy.ts
