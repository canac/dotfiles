#!/usr/bin/env bash

# Ignore errors because chron is probably already running
fish --command 'lcman start chron' || true
