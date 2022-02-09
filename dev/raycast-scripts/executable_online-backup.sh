#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Online backup
# @raycast.mode inline
# @raycast.refreshTime 1d

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.description Generate a new online backup snapshot
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

LOGFILE=$HOME/logs/online-backup.log
echo $(date) >> $LOGFILE 2>&1
echo ---------- >> $LOGFILE 2>&1
if fish -c backup >> $LOGFILE 2>&1; then
  echo "Succeeded at $(date)"
else
  echo "Failed at $(date)"
fi
