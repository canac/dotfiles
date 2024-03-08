function jr --description 'Test a file with jest'
    set file $(fd --type file --glob '*.{spec,test}.{js,ts,tsx}' | fzf --query=$argv[1] --select-1) && commandline --replace "yarn jest --runTestsByPath $file"
end
