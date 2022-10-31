#!/usr/bin/env bash

# Configure fzf
"$(brew --prefix fzf)/install" --key-bindings --no-completion --no-update-rc --no-bash --no-zsh
# Revert the fzf installer setting the fish_user_paths universal variable
# because we want global variables exclusively set in config.fish
fish -c 'set --erase -U fish_user_paths' || true
