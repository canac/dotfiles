#!/usr/bin/env fish

# In phase 2, we can use fish installed in phase 1

mise install

deno install jsr:@canac/bundle-blame --global --reload --force --allow-env --allow-read --allow-write --allow-run=git,yarn
deno install jsr:@canac/git-cleanup --global --reload --force --allow-env --allow-read --allow-run=git
