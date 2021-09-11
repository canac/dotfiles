function mkdir_and_cd --description 'mkdir a new direction and cd into it'
    mkdir -p "$argv"
    cd "$argv"
end
