#!/usr/bin/env bash

echo -e "127.0.0.1 localhost.cru.org\n::1 localhost.cru.org" | sudo ensure-lines /etc/hosts
