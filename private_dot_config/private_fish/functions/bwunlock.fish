function bwunlock --description 'Unlock Bitwarden Vault from the CLI'
    set -gx BW_SESSION (bw unlock --raw)
    bw sync
end
