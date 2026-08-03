function cru --description 'Run cru with the project name from the origin remote'
    set --local args $argv

    # Skip flags after --
    set --local flags $args
    if set --local dash_index (contains --index -- -- $args)
        set flags $args[..$dash_index]
    end

    set --local command $args[1]
    if contains -- "$command" application app a
        and not string match --quiet --regex -- '^(--name(=|$)|-[a-zA-Z]*n)' $flags
        if set --local url (command git remote get-url origin 2>/dev/null)
            # Extract the name from the origin remote URL
            set --local project (string replace --regex '\.git$' '' -- $url | path basename)
            set args $command --name $project $args[2..]
        end
    end

    CODE_FOLDER=~/dev command cru $args
end
