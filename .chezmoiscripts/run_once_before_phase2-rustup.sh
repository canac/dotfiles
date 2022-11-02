#!/usr/bin/env bash

# Run rustup-init if it hasn't been run before
test -e "$HOME/.rustup" || rustup-init -y --no-modify-path
