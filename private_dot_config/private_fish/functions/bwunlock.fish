function bwunlock --description 'Unlock Bitwarden Vault from the CLI'
    set -gx BW_SESSION $(bw login --raw || bw unlock --raw)
    bw sync
end
