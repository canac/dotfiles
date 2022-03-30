function homebrew_upgrade --description 'Update Homebrew and upgrade all installed packages'
    set TMPFILE /tmp/update-homebrew-output.txt
    brew upgrade | tee $TMPFILE
    if set -q CHRON_MAILBOX_URL
        for upgrade in (rg "==> Upgrading \d+ outdated packages?:\n([\s\S]+?)\n==>" --multiline --only-matching -r '$1' $TMPFILE)
            curl --location --silent --request POST $CHRON_MAILBOX_URL --data-raw $upgrade
        end
    end
    rm $TMPFILE
end
