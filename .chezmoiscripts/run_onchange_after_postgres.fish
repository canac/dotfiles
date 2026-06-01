#!/usr/bin/env fish

function setup_db
    set --local pg_version $argv[1]
    set --local pg_bin (brew --prefix postgresql@$pg_version)/bin

    brew services restart postgresql@$pg_version

    set --local ready
    for i in (seq 30)
        if $pg_bin/pg_isready --quiet
            set ready 1
            break
        end
        sleep 1
    end
    if not set --query ready
        echo "postgresql did not become ready" >&2
        return 1
    end

    # Delete the Homebrew-created database and create a new one with username postgres
    if not $pg_bin/psql -U postgres --command "select 1" postgres &>/dev/null
        set --local data_dir (brew --prefix)/var/postgresql@$pg_version
        trash $data_dir
        $pg_bin/initdb --locale=C --encoding=UTF-8 --username=postgres $data_dir
    end
end

setup_db 18
