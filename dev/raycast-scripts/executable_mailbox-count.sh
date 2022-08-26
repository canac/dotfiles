#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Count mailbox notifications
# @raycast.mode inline
# @raycast.refreshTime 1m

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.description Count the number of mailbox notifications
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

mailbox view | wc -l
