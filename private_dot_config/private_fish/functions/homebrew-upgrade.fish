function homebrew-upgrade --description 'Update Homebrew and upgrade all installed packages'
    set tempfile /tmp/update-homebrew-$(date +%s).txt
    HOMEBREW_COLOR=1 brew upgrade | tee $tempfile
    sed -e 's/\x1b\[[0-9;]*m//g' $tempfile | rg "==> Upgrading \d+ outdated packages?:\n([\s\S]+?)\n==>" --multiline --only-matching --replace '$1' | awk '{print "homebrew-upgrade\t"$0}' | mailbox import
    rm $tempfile
end
