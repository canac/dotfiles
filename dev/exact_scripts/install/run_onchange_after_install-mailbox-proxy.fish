#!/usr/bin/env fish

# Install mailbox-proxy
deno install --global --force \
    --allow-net=mailbox-proxy.canac.deno.net \
    --allow-run=mailbox \
    ~/dev/scripts/mailbox-proxy.ts
