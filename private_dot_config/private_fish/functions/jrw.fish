function jrw --description 'Test a file with jest in watch mode'
    set file $(fd --type file --glob '*.{spec,test}.{js,ts,tsx}' | fzf) && commandline --replace "yarn jest --runTestsByPath $file --watch"
end
