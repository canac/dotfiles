function prune-worktrees --description 'Prune git worktrees'
  while true
    set worktree $(git worktree list | gum filter | rg '^\S+' -o)
    if test $status -eq 0
      git worktree remove "$worktree"
    else
      break
    end
  end
end
