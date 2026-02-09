#!/usr/bin/env fish

# Run rustup-init if it hasn't been run before
if not test -e ~/.rustup
    rustup-init -y --no-modify-path
end

# Install clippy if it isn't installed
set rustup_bin ~/.cargo/bin/rustup
if not $rustup_bin component list --installed | grep -q clippy
    $rustup_bin component add clippy
end
