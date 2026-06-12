function ti --wraps 'teleport --interactive' --description 'Pick a ~/dev directory with fzf'
    set --local dir (teleport --interactive $argv[1])
    and cd $dir
end
