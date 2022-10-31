#!/usr/bin/env bash

# Create the postgres user if it doesn't exist yet
if [[ ! $(echo "\l" | "$(brew --prefix postgresql@15)/bin/psql" -U postgres) ]]; then
  "$(brew --prefix postgresql@15)/bin/createuser" postgres
fi
