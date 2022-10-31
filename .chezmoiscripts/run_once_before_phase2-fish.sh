#!/usr/bin/env bash

# Add fish to the shells list if it isn't there yet
shells_path="/etc/shells"
fish_bin=$(which fish)
if [[ ! $(grep "$fish_bin" "$shells_path") ]]; then
  echo "$fish_bin" | sudo tee -a "$shells_path"
fi

# Make fish the default shell if it isn't already
if [[ "$SHELL" != "$fish_bin" ]]; then
  chsh -s "$fish_bin"
fi
