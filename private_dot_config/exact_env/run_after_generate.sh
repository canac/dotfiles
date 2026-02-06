#!/usr/bin/env bash

for file in $(fd 'generate_*' ~/.config/env --type=file); do
  ~/dev/scripts/generate-cached.fish $file > /dev/null
done
