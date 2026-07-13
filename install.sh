#!/usr/bin/env bash

if [[ $(uname -s) != "Darwin" ]]; then
  sudo apt install curl gcc git
fi

# Install Homebrew and extract the Homebrew binary location
homebrew_bin=$(/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" | tee /dev/tty | grep '^.\+/bin/brew$')
eval "$("$homebrew_bin" shellenv)"

# Install and run chezmoi
brew install chezmoi
chezmoi init --apply canac
