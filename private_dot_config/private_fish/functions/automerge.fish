function automerge --description "Merge a PR once its CI passes"
    set pr $argv[1]
    if test -z "$pr"
        set pr (gh pr view --json url --jq .url) || return 1
    end

    for round in (seq 5)
        gh pr checks $pr --watch --fail-fast || return 1
        gh pr merge $pr && return 0

        # Detect behind base, update, and retry
        string match --quiet BEHIND (gh pr view $pr --json mergeStateStatus --jq .mergeStateStatus) || return 1
        gh pr update-branch $pr || return 1
    end

    echo "automerge: $pr still behind its base after 5 attempts" >&2
    return 1
end
