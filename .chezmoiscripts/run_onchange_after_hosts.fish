#!/usr/bin/env fish

printf "127.0.0.1 localhost.cru.org\n::1 localhost.cru.org\n" | sudo ensure-lines /etc/hosts
