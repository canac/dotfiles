function kill-port --description 'Kill process running on a specific port'
    if test (count $argv) -eq 0
        echo "Usage: kill-port <port_number>" >&2
        return 1
    end

    set port $argv[1]
    set pids (lsof -t -i:$port 2>/dev/null)
    or begin
        echo "No processes running on port $port" >&2
        return 1
    end

    kill -9 $pids
    echo "Killed process on port $port"
end
