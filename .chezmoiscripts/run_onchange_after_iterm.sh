#!/usr/bin/env bash

# Install iTerm integration if it isn't already installed
test -e "$HOME/.iterm2_shell_integration.fish" || curl -L https://iterm2.com/shell_integration/install_shell_integration_and_utilities.sh | SHELL=fish bash
