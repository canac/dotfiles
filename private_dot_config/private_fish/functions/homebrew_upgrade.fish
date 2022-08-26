function homebrew_upgrade --description 'Update Homebrew and upgrade all installed packages'
    set tempfile /tmp/update-homebrew-(date +%s).txt
    HOMEBREW_COLOR=1 brew upgrade | tee $tempfile
    cat $tempfile | sed -e 's/\x1b\[[0-9;]*m//g' | rg "==> Upgrading \d+ outdated packages?:\n([\s\S]+?)\n==>" --multiline --only-matching -r '$1' | awk '{print "homebrew-upgrade\t"$0}' | mailbox import
    rm $tempfile
end
