#!/usr/bin/env fish

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Strip Smart Quotes
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🔤

# Documentation:
# @raycast.description Remove smart quotes from copied text
# @raycast.author Caleb Cox
# @raycast.authorURL https://github.com/canac

pbpaste | string replace -ra '[“”„‟]' '"' | string replace -ra "[‘’‚‛]" "'" | pbcopy
echo "Stripped smart quotes"
