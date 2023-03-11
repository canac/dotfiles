#!/usr/bin/env bash

# Delete the Homebrew-created database and create a new one with username postgres
pg_bin=$(brew --prefix postgresql@15)/bin
if "$pg_bin/psql" -c "\du" postgres | grep "$USER"; then
  data_dir=$(brew --prefix)/var/postgresql@15
  rm -rf "$data_dir"
  "$pg_bin/initdb" --locale=C --encoding=UTF-8 --username=postgres "$data_dir"
fi
