function kill-port --description 'Kill process running on a specific port'
    if test (count $argv) -eq 0
        echo "Usage: kill-port <port_number>"
        return 1
    end

    set port $argv[1]
    if not set pids (lsof -t -i:$port 2>/dev/null)
        echo "No processes running on port $port"
        return 1
    end

    kill -9 $pids
    echo "Killed process on port $port"
end
