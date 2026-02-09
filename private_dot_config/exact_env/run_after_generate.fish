#!/usr/bin/env fish

for file in (fd . ~/.config/env --type=executable)
    ~/dev/scripts/generate-cached.fish $file >/dev/null
end
