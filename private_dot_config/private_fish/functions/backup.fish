function backup --description 'Backup online using Restic'
    set -lx BW_SESSION (bw unlock --raw)
    set -lx RESTIC_PASSWORD (bw get notes RESTIC_PASSWORD)
    set -lx B2_ACCOUNT_ID (bw get notes B2_ACCOUNT_ID)
    set -lx B2_ACCOUNT_KEY (bw get notes B2_ACCOUNT_KEY)
    fd -H .gitignore dev -E third-party/ -E forks/ --exec-batch cat | sed 's@^/@@' > /tmp/combined-gitignore.txt
    restic backup ~/dev -r b2:grader-rectify-patio --verbose --files-from backup-include.txt --exclude-file backup-exclude.txt --exclude-file /tmp/combined-gitignore.txt
end
