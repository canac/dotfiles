function lcman --description 'launchctl manager'
    if test $(count $argv) -ne 2
        echo "Usage: lcman [start|stop|restart] [service]"
        return 1
    end

    set command $argv[1]
    set service $argv[2]
    set domain_target gui/$(id -u $USER)
    set plist_file $HOME/Library/LaunchAgents/com.canac.$service.plist

    switch $command
        case start
            launchctl bootstrap $domain_target $plist_file
        case stop
            launchctl bootout $domain_target/com.canac.$service
        case restart
            launchctl bootout $domain_target/com.canac.$service
            launchctl bootstrap $domain_target $plist_file
        case '*'
            echo "Invalid command: $command must be one of start, stop, restart"
            return 1
    end
end
