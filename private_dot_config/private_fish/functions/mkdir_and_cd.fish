function mkdir_and_cd --description 'mkdir a new directory and cd into it'
    mkdir -p "$argv"
    cd "$argv"
end
