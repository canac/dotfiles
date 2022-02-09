#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Update Homebrew
# @raycast.mode inline
# @raycast.refreshTime 1d

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.description Update installed Homebrew formulae
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

LOGFILE=$HOME/logs/update-homebrew.log
echo $(date) >> $LOGFILE 2>&1
echo ---------- >> $LOGFILE 2>&1
if brew upgrade >> $LOGFILE 2>&1; then
  echo "Succeeded at $(date)"
else
  echo "Failed at $(date)"
fi
