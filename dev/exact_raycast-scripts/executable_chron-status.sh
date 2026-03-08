#!/usr/bin/env bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Chron Status
# @raycast.mode inline
# @raycast.refreshTime 1m

# Optional parameters:
# @raycast.icon 🕓

# Documentation:
# @raycast.description Check whether the chron server is running
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

if chron jobs > /dev/null 2>&1; then
  echo "Running"
else
  echo "Not running"
fi
