function insert-git-pick --description 'Execute git-pick and add it to the current command line'
    commandline --insert $(git pick)
end
