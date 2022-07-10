function homebrew_upgrade --description 'Update Homebrew and upgrade all installed packages'
    set TMPFILE /tmp/update-homebrew-output.txt
    brew upgrade | tee $TMPFILE
    for upgrade in (rg "==> Upgrading \d+ outdated packages?:\n([\s\S]+?)\n==>" --multiline --only-matching -r '$1' $TMPFILE)
        mailbox add homebrew-upgrade $upgrade
    end
    rm $TMPFILE
end
