function start --description 'Start a project'
    set repo $(git remote get-url origin)
    if test $repo = "https://github.com/CruGlobal/conf-registration-web.git"
        portman create --overwrite --link 9000
        yarn start
    else if test $repo = "https://github.com/CruGlobal/give-web.git"
        portman create --overwrite --link 9000
        yarn start
    else if test $repo = "https://github.com/CruGlobal/ml.git"
        portman create --overwrite --link 9000
        yarn start
    else if test $repo = "https://github.com/CruGlobal/mpdx_api.git"
        portman create --overwrite --link 3001
        rails s
    else if test $repo = "https://github.com/CruGlobal/mpdx-react.git"
        portman create --overwrite --link 3000
        yarn start
    else if test $repo = "https://github.com/CruGlobal/mpdx_web.git"
        portman create --overwrite --link 8081
        npm start
    else
        echo "Warning: unrecognized repository $repo"
        yarn start
    end
end
