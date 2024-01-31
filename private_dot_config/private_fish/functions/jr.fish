function jr --description 'Test a file with jest'
    set file $(fd --type file --glob '*.{spec,test}.{js,ts,tsx}' | fzf) && commandline --replace "yarn jest --runTestsByPath $file"
end
