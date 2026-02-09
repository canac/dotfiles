#!/usr/bin/env fish

# Add fish to the shells list if it isn't there yet
set fish_bin (command -s fish)
echo $fish_bin | sudo ensure-lines /etc/shells

# Make fish the default shell if it isn't already
if test $SHELL != $fish_bin
    chsh -s $fish_bin
end
