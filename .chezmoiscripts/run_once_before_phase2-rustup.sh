#!/usr/bin/env bash

# Run rustup-init if it hasn't been run before
if [[ ! -e "$HOME/.rustup" ]]; then
  rustup-init -y --no-modify-path
fi
