#!/usr/bin/env fish

brew services restart postgresql@18

function setup_db
    set --local pg_version $argv[1]

    # Delete the Homebrew-created database and create a new one with username postgres
    set --local pg_bin (brew --prefix postgresql@$pg_version)/bin
    if $pg_bin/psql -c "\\du" postgres | grep -q $USER
        set --local data_dir (brew --prefix)/var/postgresql@$pg_version
        trash $data_dir
        $pg_bin/initdb --locale=C --encoding=UTF-8 --username=postgres $data_dir
    end
end

setup_db 18
