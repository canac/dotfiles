#!/usr/bin/env bash

echo "VITE_JWT_SECRET=$(openssl rand -hex 32)"
echo "VITE_AUTH_PASSWORD=$(bw generate --passphrase | cut -d'-' -f1)"
