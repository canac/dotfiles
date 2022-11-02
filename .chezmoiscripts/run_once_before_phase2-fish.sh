#!/usr/bin/env bash

# Add fish to the shells list if it isn't there yet
shells_path="/etc/shells"
fish_bin=$(which fish)
grep "$fish_bin" "$shells_path" || echo "$fish_bin" | sudo tee -a "$shells_path"

# Make fish the default shell if it isn't already
test "$SHELL" == "$fish_bin" || chsh -s "$fish_bin"
