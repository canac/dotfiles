#!/usr/bin/env bash

if [[ $(uname -s) != "Darwin" ]]; then
  sudo apt install curl gcc git
fi

# Install Homebrew and extract the Homebrew binary location
homebrew_bin=$(/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" | tee /dev/tty | grep '^.\+/bin/brew$')
eval "$("$homebrew_bin" shellenv)"

# Install bootstrap dependencies
brew bundle --no-lock --file=- <<EOF
brew "bitwarden-cli"
brew "chezmoi"
brew "gnupg"
EOF

# Log into Bitwarden, or unlock the vault if the user is already logged in
BW_SESSION=$(bw login --raw || bw unlock --raw)
export BW_SESSION
bw sync

# Import the GPG signing key if it hasn't been imported already
# because it will be needed by chezmoi to decrypt files
export SIGNING_KEY_ID="A88CE79A6BAC53C39AC331099025163398B61D7E"
if ! gpg --list-secret-keys "$SIGNING_KEY_ID"; then
  bw get attachment private.key --itemid "GPG signing key"
  passphrase=$(bw get notes "GPG passphrase")
  gpg --import private.key --passphrase "$passphrase"
  echo "$SIGNING_KEY_ID:6:" | gpg --import-ownertrust
  rm private.key
fi

# Run chezmoi
chezmoi init --apply canac
