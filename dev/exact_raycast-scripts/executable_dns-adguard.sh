#!/usr/bin/env fish

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Enable AdGuard
# @raycast.mode silent

# Optional parameters:
# @raycast.icon ☁️

# Documentation:
# @raycast.description Switch to AdGuard for DNS resolution on this machine
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

dns-resolver adguard
echo "Switched to AdGuard for DNS resolution"
