function pull-all --description 'Pull the latest code from all Cru repos'
    for dir in (fd --type directory --exact-depth 1 . ~/dev)
        set origin (git -C $dir remote get-url origin 2>/dev/null)
        if not string match -q "https://github.com/CruGlobal/*" $origin
            continue
        end

        set branch (git -C $dir branch --show-current 2>/dev/null)
        if not contains $branch main master
            continue
        end

        echo "Pulling $dir..."
        git -C $dir pull
    end
end
