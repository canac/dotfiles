#!/usr/bin/env fish

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Enable NextDNS
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🛡️

# Documentation:
# @raycast.description Start using NextDNS for DNS resolution on this machine
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

dns-resolver nextdns
echo "Using NextDNS for DNS resolution"
