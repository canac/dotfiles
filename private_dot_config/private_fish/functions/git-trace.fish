function git-trace --description 'Browse git history for a file'
    while true
        # On escape exit
        set file (fd --type file --hidden --exclude=.git/ | fzf --query=$argv[1] --select-1 --ghost "Choose a file to trace its history" || return)
        while true
            # On escape pick another file
            set result (git l -- "$file" | fzf --preview "git -c color.ui=always sw {1} -- \"$file\"" --preview-window 'right,75%' --accept-nth 1 --expect=ctrl-r,ctrl-x) || break
            if test $result[1] = ctrl-x
                # On Ctrl+x exit completely
                return
            end

            set commit $result[2]

            if test $result[1] = ctrl-r
                # On Ctrl+r add the command to history and exit completely
                git --no-pager show $commit -- $file
                history append -- "git show $commit -- $file"
                return
            else
                DELTA_PAGER="less -+F" git show $commit -- $file
            end
        end
    end
end
