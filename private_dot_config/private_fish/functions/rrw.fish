function rrw --description 'Test a file with rspec in watch mode'
    set file $(fd --type file --glob '*_spec.rb' spec/ | fzf --query=$argv[1] --select-1) &&
        commandline --replace "watchexec -- rspec $file" &&
        commandline --function execute
end
