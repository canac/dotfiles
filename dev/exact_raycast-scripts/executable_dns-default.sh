#!/usr/bin/env fish

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Disable DNS filtering
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🚫

# Documentation:
# @raycast.description Switch to the network default for DNS resolution on this machine
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

dns-resolver default
echo "Switched to network default for DNS resolution"
