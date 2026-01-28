function rt --description 'Run tests for a file'
    if test -f Gemfile
        set pattern "*_spec.rb"
        set search_path spec/
        set run_cmd rspec
        set watch_cmd "watchexec -- $run_cmd"
    else if test -f yarn.lock
        set pattern '*.{spec,test}.{js,ts,tsx}'
        set run_cmd "yarn jest --runTestsByPath"
        set watch_cmd "$run_cmd --watch"
    else
        echo "Error: no test runner found"
        return 1
    end

    set result $(fd --type file --glob $pattern $search_path |
        fzf --query=$argv[1] --select-1 --expect=ctrl-e,ctrl-w) || return 1

    set key $result[1]
    set file $result[2]
    set cmd "$run_cmd $file"

    switch $key
        case ctrl-w
            set cmd "$watch_cmd $file"
        case ctrl-e
            commandline --replace $cmd
            return
    end

    history append $cmd
    eval $cmd
end
