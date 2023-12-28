#!/usr/bin/env bash

# Ignore errors because chron is probably already running
fish -c 'lcman start chron' || true
