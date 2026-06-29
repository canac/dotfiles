function cleanup-all --description 'Clean up merged worktrees and branches'
    git cleanup (fd --type directory --exact-depth 2 --hidden '^\.git$' ~/dev)
end
