function lcman --description 'launchctl manager'
    function usage
        echo "Usage: lcman [print|start|stop|restart] [service]"
    end

    if test $(count $argv) -ne 2
        usage
        return 1
    end

    set command $argv[1]
    set service $argv[2]
    set domain_target gui/$(id -u $USER)
    if not set plist_file $(fd --type file . $HOME/Library/LaunchAgents | rg --fixed-strings ".$service.plist")
        echo "Service not found: $service"
        return 1
    end
    set full_service $(basename $plist_file .plist) || return 1

    switch $command
        case print
            bat $plist_file
        case start
            launchctl bootstrap $domain_target $plist_file
        case stop
            launchctl bootout $domain_target/$full_service
        case restart
            launchctl bootout $domain_target/$full_service
            launchctl bootstrap $domain_target $plist_file
        case '*'
            usage
            return 1
    end
end
