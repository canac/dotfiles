function wrap-watchexec --description 'Wrap the current command line with watchexec'
    commandline --replace "watchexec -- $(commandline)"
end
