function go --description 'Change the currenct directory to a development project'
    set dir $(fd . ~/dev --type=directory --maxdepth=1 | fzf) && z $dir
end
