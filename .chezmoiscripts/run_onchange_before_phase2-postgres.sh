#!/usr/bin/env bash

brew services restart postgresql@18

# Delete the Homebrew-created database and create a new one with username postgres
pg_bin=$(brew --prefix postgresql@18)/bin
if "$pg_bin/psql" -c "\du" postgres | grep --silent "$USER"; then
  data_dir=$(brew --prefix)/var/postgresql@18
  rm -rf "$data_dir"
  "$pg_bin/initdb" --locale=C --encoding=UTF-8 --username=postgres "$data_dir"
fi
