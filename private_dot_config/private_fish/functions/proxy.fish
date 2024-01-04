function proxy --description 'Set system HTTP(S) proxy status'
    if test $(count $argv) -ne 1
        echo "Usage: proxy [on|off]"
        return 1
    end

    set state $argv[1]
    switch $state
        case on
            # Setup HTTP and HTTPS proxy in macOS settings, which also turns the proxy on
            set port $(portman allocate mitmproxy --matcher=none)
            networksetup -setwebproxy "Wi-Fi" localhost $port
            networksetup -setsecurewebproxy "Wi-Fi" localhost $port
        case off
            # Turn the proxy off
            networksetup -setwebproxystate "Wi-Fi" off
            networksetup -setsecurewebproxystate "Wi-Fi" off
        case '*'
            echo "Invalid state: $state must be on or off"
            return 1
    end
end
