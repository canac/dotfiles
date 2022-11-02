#!/usr/bin/env fish

# hash: {{ joinPath .chezmoi.sourceDir "private_Library/LaunchAgents/com.canac.chron.plist.tmpl" | include | sha256sum }}

# Reload chron when the plist changes
lcman restart chron
