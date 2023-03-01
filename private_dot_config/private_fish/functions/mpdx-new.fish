function mpdx-new --description 'Create a new MPDX worktree'
    set dirname_suffix $(gum input --prompt "Directory name: mpdx-" --placeholder="") &&
    set dirname "mpdx-$dirname_suffix" &&
    set directory "$HOME/dev/$dirname" &&
    set branch $(gum input --prompt "Branch name: " --value "$dirname_suffix") &&
    set root_directory "$HOME/dev/mpdx-react" &&
    cd $root_directory &&
    git worktree add -b $branch $directory main &&
    cd $directory &&
    cp $root_directory/.env $directory &&
    yarn &&
    yarn gql &&
    yarn gql:server &&
    code .
end
