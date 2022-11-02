#!/usr/bin/env bash

# Create the postgres user if it doesn't exist yet
pg_bin="$(brew --prefix postgresql@15)/bin"
echo "\l" | "$pg_bin/psql" -U postgres || "$pg_bin/createuser" postgres
