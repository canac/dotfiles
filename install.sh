#!/usr/bin/env bash

if [[ $(uname -s) != "Darwin" ]]; then
  sudo apt install curl gcc git
fi

# Install Homebrew and extract the Homebrew binary location
homebrew_bin=$(/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" | tee /dev/tty | grep '^.\+/bin/brew$')
eval "$("$homebrew_bin" shellenv)"

# Install bootstrap dependencies
brew bundle --file=- <<EOF
brew "chezmoi"
brew "doppler"
brew "gnupg"
EOF

# Authenticate with Doppler so chezmoi and the steps below can read secrets
doppler me >/dev/null 2>&1 || doppler login

# Import the GPG signing key if it hasn't been imported already
# because it will be needed by chezmoi to decrypt files
export SIGNING_KEY_ID="A88CE79A6BAC53C39AC331099025163398B61D7E"
if ! gpg --list-secret-keys "$SIGNING_KEY_ID"; then
  doppler secrets get GPG_PRIVATE_KEY --project chezmoi --config main --plain | base64 --decode > private.key
  doppler secrets get GPG_PASSPHRASE --project chezmoi --config main --plain \
    | gpg --batch --pinentry-mode loopback --passphrase-fd 0 --import private.key
  echo "$SIGNING_KEY_ID:6:" | gpg --import-ownertrust
  rm private.key
fi

# Run chezmoi
chezmoi init --apply canac
