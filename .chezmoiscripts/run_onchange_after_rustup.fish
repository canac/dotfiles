#!/usr/bin/env fish

# Run rustup-init if it hasn't been run before
if not test -e ~/.rustup
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
end

# Install clippy if it isn't installed
rustup component add clippy

# Install the stable toolchain
rustup install
