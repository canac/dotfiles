function mpdx-init --description 'Initialize a new MPDX worktree'
    cp $HOME/dev/mpdx-react/.env .
    yarn
    yarn gql
    yarn gql:server
end
