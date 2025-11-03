function rr --description 'Test a file with rspec'
    set file $(fd --type file --glob '*_spec.rb' spec/ | fzf --query=$argv[1] --select-1) &&
        commandline --replace "rspec $file" &&
        commandline --function execute
end
