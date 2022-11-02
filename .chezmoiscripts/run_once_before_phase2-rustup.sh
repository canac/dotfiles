#!/usr/bin/env bash

# Run rustup-init if it hasn't been run before
test -e "$HOME/.rustup" || rustup-init -y --no-modify-path

# Install clippy if it isn't installed
rustup_bin=$HOME/.cargo/bin/rustup
$rustup_bin component list --installed | grep clippy || $rustup_bin component add clippy
