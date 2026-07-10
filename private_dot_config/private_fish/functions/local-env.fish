function local-env --description "Run a command with a project's deployment env injected"
    set --local env $argv[1]
    set --erase argv[1]

    if test -z "$env"
        echo "Usage: local-env <environment> <command...>" >&2
        return 1
    end

    set --local origin (git remote get-url origin 2>/dev/null)
    if test -z "$origin"
        echo "local-env: not in a git repo with an origin remote" >&2
        return 1
    end
    set --local repo (basename $origin .git)

    set --local envfile ~/.config/env/$repo/.env.local.$env
    if not test -e $envfile
        echo "local-env: no $env env file for $repo" >&2
        return 1
    end

    if test -x $envfile
        set envfile (~/dev/scripts/generate-cached.fish $envfile)
    end

    dotenvx run --env-file $envfile -- $argv
end
