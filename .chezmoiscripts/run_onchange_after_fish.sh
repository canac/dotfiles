#!/usr/bin/env bash

# Add fish to the shells list if it isn't there yet
fish_bin=$(which fish)
echo "$fish_bin" | sudo ensure-lines /etc/shells

# Make fish the default shell if it isn't already
test "$SHELL" == "$fish_bin" || chsh -s "$fish_bin"
