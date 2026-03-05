function claude --description "Enable YOLO mode in Claude Code" --wraps claude
    command claude --allow-dangerously-skip-permissions $argv
end
