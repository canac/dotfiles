function gh-repo --description 'Open GitHub repo in browser'
    set repos "give-web
conf-registration-web
mpdx-react
mpdx_web
cru-terraform
mpdx_api"
    open https://github.com/CruGlobal/$(echo $repos | fzf)
end
