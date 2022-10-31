#!/usr/bin/env bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title View mailbox notifications
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.description View unread mailbox notifications mailbox notifications
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

mailbox view --color --timestamp-format=relative
