#!/usr/bin/env bash

echo "AUTH_PASSWORD=$(curl -s https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt | sort -R | head -n1 | cut -f2)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
