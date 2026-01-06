#!/usr/bin/env bash
HOSTS_FILE="/etc/hosts"

add_host_entry() {
    local entry="$1"

    if ! rg --fixed-strings --line-regexp --quiet "$entry" "$HOSTS_FILE"; then
        echo "$entry" | sudo tee -a "$HOSTS_FILE" > /dev/null
    fi
}

add_host_entry "127.0.0.1 localhost.cru.org"
add_host_entry "::1 localhost.cru.org"
