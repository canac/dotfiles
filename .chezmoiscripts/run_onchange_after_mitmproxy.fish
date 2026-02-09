#!/usr/bin/env fish

set certificate_file ~/.mitmproxy/mitmproxy-ca-cert.pem

if not test -e $certificate_file
    # Start mitmproxy in the background to create the certificate file and wait for it to exist
    mitmproxy >/dev/null 2>&1 &
    set mitmproxy_pid $last_pid
    while not test -e $certificate_file
        sleep 0.1
    end
    kill $mitmproxy_pid
end

if not security verify-cert -c $certificate_file
    security add-trusted-cert $certificate_file
end
