#!/usr/bin/env bash

for file in $(fd '{generate_,secrets_}*' ~/.config/env --type=file --glob); do
  ~/dev/scripts/generate-cached.fish $file > /dev/null
done
