function go --description 'Change the current directory to a development project'
    set dir $(fd . ~/dev --type=directory --maxdepth=1 | fzf) && z $dir
end
