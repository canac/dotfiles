# Run with mitmdump --quiet --ssl-insecure --scripts ~/dev/proxy.py

from mitmproxy import http

def response(flow: http.HTTPFlow):
    pass
