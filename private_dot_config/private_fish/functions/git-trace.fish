function git-trace --description 'Browse git history for a file'
    set file (fd --type file --hidden --exclude=.git/ | fzf --query=$argv[1] --select-1 --ghost "Choose a file to trace its history" || return 1)
    set commit (git l -- "$file" | fzf --preview "git -c color.ui=always sw {1} -- \"$file\"" --preview-window 'right,75%' --accept-nth 1 || return 1)
    set cmd "git show $commit -- $file"
    history append -- "$cmd"
    eval $cmd
end
