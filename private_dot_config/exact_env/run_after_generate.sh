#!/usr/bin/env bash

for file in $(fd . ~/.config/env --type=executable); do
  ~/dev/scripts/generate-cached.fish "$file" > /dev/null
done
