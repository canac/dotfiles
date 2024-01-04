#!/usr/bin/env bash

certificate_file="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"

if ! [[ -e "$certificate_file" ]]; then
  # Start mitmproxy in the background to create the certificate file and wait for it to exist
  mitmproxy > /dev/null 2>&1 &
  mitmproxy_pid="$!"
  until [[ -e "$certificate_file" ]]; do
    sleep 0.1
  done
  kill "$mitmproxy_pid"
fi

security verify-cert -c "$certificate_file" || security add-trusted-cert "$certificate_file"
