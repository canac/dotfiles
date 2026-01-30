function worktree-add --description 'Add a new worktree'
    set repo_url $(git remote get-url origin || return 1)
    if not set full_repo $(echo $repo_url | rg '^https:\/\/github\.com\/(.+?\/.+?)\.git$' --replace '$1')
        echo "Repo \"$repo_url\" does not match a GitHub repo"
        return 1
    end
    set parts $(string split / $full_repo)
    set org $parts[1]
    set repo $parts[2]
    set dir_prefix $(jq --arg org $org --arg repo $repo '.prefixes[$org + "/" + $repo] // $repo' --raw-output $HOME/.config/worktrees.json)

    # Ensure we have the latest branches
    git fetch

    # Use the branch name from the first argument if present
    if test $(count $argv) -ge 1
        set branch $argv[1]
        if git show-ref --quiet refs/heads/$branch
            set branch_type existing
        else
            set branch_type new
        end
        echo "Using $branch_type branch $branch"
    end

    if not set --query branch_type
        set branch_type $(gum filter new existing --header="Do you want to base the worktree on a new branch or an existing branch?" --height=6 --placeholder="" || return 1)
        switch $branch_type
            case new
                set branch $(gum input --prompt="New branch name: " --placeholder="" || return 1)
            case existing
                set branch $(git for-each-ref 'refs/heads/*' 'refs/remotes/origin/*' --format '%(refname:short)' --sort '-committerdate' | fzf || return 1)
                set branch $(echo $branch | string split /)[-1]
        end
    end

    set dir_suffix $(gum input --prompt="Directory name: $dir_prefix-" --placeholder="" --value=$branch || return 1)
    set directory $HOME/dev/$dir_prefix-$dir_suffix

    # Disable overcommit while creating worktrees to errors about the signature changing
    switch $branch_type
        case new
            OVERCOMMIT_DISABLE=1 git worktree add -b $branch $directory origin/$(git primary) --no-track || return 1
        case existing
            OVERCOMMIT_DISABLE=1 git worktree add $directory --checkout $branch || return 1
    end

    z $directory
    if test -e yarn.lock
        yarn
    else if test -e pnpm-lock.yaml
        pnpm install
    else if test -e package-lock.json
        npm install
    else if test -e Gemfile.lock
        bundle install
    else
        echo "No lockfile found"
    end
    setup-env --new
    portman create
    if test $org = CruGlobal
        set profile Work
    else
        set profile Default
    end
    code --profile $profile $directory
end
