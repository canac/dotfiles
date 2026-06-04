function homebrew-upgrade --description 'Update Homebrew and upgrade all installed packages'
    set --local fifo (mktemp -u)
    mkfifo $fifo
    brew upgrade | tee $fifo &
    sed -e 's/\x1b\[[0-9;]*m//g' <$fifo | rg "==> Upgrading \d+ outdated packages?:\n([\s\S]+?)\n==>" --multiline --only-matching --replace '$1' | awk '{print "homebrew-upgrade\t"$0}' | mailbox import
    wait
    rm $fifo
end
