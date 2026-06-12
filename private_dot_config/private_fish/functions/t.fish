function t --wraps teleport --description 'Jump to a frecent ~/dev directory'
    set --local dir (teleport $argv[1])
    and cd $dir
end
