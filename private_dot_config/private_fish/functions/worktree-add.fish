function worktree-add --description 'Add a new worktree'
    set full_repo $(git remote get-url origin) || return 1
    set dir_prefix
    if ! set repo $(echo $full_repo | rg '^https:\/\/github\.com\/CruGlobal\/(.+?)\.git$' -r '$1')
        echo "Repo \"$full_repo\" does not match a CruGlobal GitHub repo"
        return 1
    end

    set dir_prefix $(dasel --file $HOME/.config/worktrees.toml "repos.$repo.prefix" --write plain || return 1)
    set init_command $(dasel --file $HOME/.config/worktrees.toml "repos.$repo.property(init_command?)" --write plain || return 1)

    set branch_type $(gum filter new existing --header="Do you want to base the worktree on a new branch or an existing branch?" --placeholder="" || return 1)
    git fetch
    switch $branch_type
        case new
            set branch $(gum input --prompt="New branch name: " --placeholder="" --width=0 || return 1)
        case existing
            set branch $(git for-each-ref 'refs/heads/*' 'refs/remotes/origin/*' --format '%(refname:short)' --sort '-committerdate' | fzf || return 1)
            set branch $(echo $branch | string split /)[-1]
    end

    set dir_suffix $(gum input --prompt="Directory name: $dir_prefix-" --placeholder="" --width=0 --value=$branch) || return 1
    set directory $HOME/dev/$dir_prefix-$dir_suffix

    switch $branch_type
        case new
            git worktree add -b $branch $directory origin/$(git primary) --no-track || return 1
        case existing
            git worktree add $directory --checkout $branch || return 1
    end

    z $directory
    if set -q init_command
        echo $init_command | source
    end
    if test -e yarn.lock
        yarn
    else if test -e package-lock.json
        npm install
    else
        echo "No yarn.lock or package-lock.json file found"
    end
    portman create
    code $directory
end
