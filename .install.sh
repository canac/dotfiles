#!/usr/bin/env bash

# Read the signing key ID from the source file shared with .chezmoi.toml.tmpl
SIGNING_KEY_ID="$(cat "$(dirname "$0")/.signing_key_id")"

# Fast abort if the signing key is already imported
if gpg --list-secret-keys "$SIGNING_KEY_ID" >/dev/null 2>&1; then
  exit 0
fi

# Install bootstrap dependencies
brew install doppler gnupg

# Authenticate with Doppler so chezmoi and the steps below can read secrets
doppler me >/dev/null 2>&1 || doppler login

# Import the GPG signing key if it hasn't been imported already
# because it will be needed by chezmoi to decrypt files
doppler secrets get GPG_PASSPHRASE --project chezmoi --config main --plain \
  | gpg --batch --pinentry-mode loopback --passphrase-fd 0 \
    --import <(doppler secrets get GPG_PRIVATE_KEY --project chezmoi --config main --plain | base64 --decode)
echo "$SIGNING_KEY_ID:6:" | gpg --import-ownertrust
