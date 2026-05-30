# git-work writes the new worktree path to this path here so the shell can cd
# into it, inspired by lazygit
if not set --query GIT_WORK_NEW_DIR_FILE
    set --export --global GIT_WORK_NEW_DIR_FILE (mktemp)
end

function __git_work_chdir --on-event fish_postexec
    if test -s $GIT_WORK_NEW_DIR_FILE
        cd (cat $GIT_WORK_NEW_DIR_FILE)
        rm -f $GIT_WORK_NEW_DIR_FILE
    end
end
