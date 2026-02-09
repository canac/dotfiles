#!/usr/bin/env fish

# Install iTerm integration if it isn't already installed
if not test -e ~/.iterm2_shell_integration.fish
    curl -L https://iterm2.com/shell_integration/install_shell_integration_and_utilities.sh | env SHELL=fish bash
end
