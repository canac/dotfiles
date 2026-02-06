#!/usr/bin/env fish

argparse regenerate -- $argv || return 1
set filename $argv[1]

if test -z $filename
    echo "Usage: generate-cached.fish [--regenerate] <generator-script>" >&2
    return 1
end

set cache_dir ~/.cache/generator
mkdir -p $cache_dir

set hash (sha256sum $filename | cut -d' ' -f1)
set cache_file $cache_dir/$hash

if not test -f $cache_file; or set -q _flag_regenerate
    $filename >$cache_file
end

echo $cache_file
