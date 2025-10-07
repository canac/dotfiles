#!/usr/bin/env bash

printf "VITE_JWT_SECRET=$(openssl rand -hex 32)\nVITE_AUTH_PASSWORD=$(bw generate --passphrase | cut -d'-' -f1)\n"
