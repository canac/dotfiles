function automerge --description "Merge a PR once its CI passes"
    set pr_fields (gh pr view $argv[1] --json url,id --jq '.url, .id') || return 1
    set pr $pr_fields[1]

    set base (gh api graphql -F id=$pr_fields[2] --jq '.data.node.baseRepository | .nameWithOwner, .mergeCommitAllowed' -f query='
        query($id: ID!) {
            node(id: $id) {
                ... on PullRequest {
                    baseRepository {
                        nameWithOwner
                        mergeCommitAllowed
                    }
                }
            }
        }') || return 1
    set repo $base[1]
    set allows_merge $base[2]

    # Repos to prefer squash-merge
    set squash_repos CruGlobal/mpdx_api

    if contains $repo $squash_repos
        set method --squash
    else if test "$allows_merge" = true
        set method --merge
    else
        set method --squash
    end

    for round in (seq 5)
        gh pr checks $pr --watch --fail-fast || return 1
        gh pr merge $method $pr && return 0

        switch (gh pr view $pr --json mergeStateStatus --jq .mergeStateStatus)
            case BEHIND
                # Detect behind base, update, and retry
                gh pr update-branch $pr || return 1
            case BLOCKED UNKNOWN
                # Wait for GitHub to asynchronously recompute mergeability
                sleep 10
            case '*'
                return 1
        end
    end

    echo "automerge: $pr was still not mergeable after 5 attempts" >&2
    return 1
end
