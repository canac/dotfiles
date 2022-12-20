function mpdx-new --description 'Create a new MPDX worktree'
    set jira $(gum input --placeholder "Jira issue number")
    set branch $(gum input --placeholder "Git branch suffix")
    set directory "$HOME/dev/mpdx-$jira"
    set root_directory "$HOME/dev/mpdx-react"
    cd $root_directory
    git worktree add -b mpdx-$jira-$branch $directory main
    cd $directory
    cp $root_directory/.env $directory
    yarn
    yarn gql
    yarn gql:server
end
