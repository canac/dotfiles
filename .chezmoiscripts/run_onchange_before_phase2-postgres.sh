#!/usr/bin/env bash

brew services restart postgresql@18

setup_db() {
  local version=$1

  # Delete the Homebrew-created database and create a new one with username postgres
  pg_bin=$(brew --prefix postgresql@$version)/bin
  if "$pg_bin/psql" -c "\du" postgres | grep --silent "$USER"; then
    data_dir=$(brew --prefix)/var/postgresql@$version
    trash "$data_dir"
    "$pg_bin/initdb" --locale=C --encoding=UTF-8 --username=postgres "$data_dir"
  fi
}

setup_db 18
