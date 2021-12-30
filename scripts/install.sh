#!/bin/bash

/bin/bash -c "$(curl -fsLS https://raw.githubusercontent.com/canac/dotfiles/main/.chezmoitemplates/install.sh.tmpl | sh -c "$(curl -fsLS git.io/chezmoi)" -- execute-template)"
