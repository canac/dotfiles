#!/usr/bin/env fish

# hash: {{ include "dev/exact_scripts/git-work.ts" | sha256sum }}

git-work completion fish >~/.config/fish/completions/git-work.fish
