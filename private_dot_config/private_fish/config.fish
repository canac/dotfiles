set PATH $HOME/.kenv/bin $HOME/.local/bin /usr/local/opt/ruby/bin (go env GOPATH)/bin /usr/local/sbin $PATH
sh "$HOME/.cargo/env"
starship init fish | source
