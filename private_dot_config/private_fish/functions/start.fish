function start --description 'Start a project'
    portman link

    if mise task info start --local &>/dev/null
        mise task run start
    else if test -e Gemfile
        rails server
    else if test -e yarn.lock
        yarn start
    else if test -e package-lock.json
        npm start
    else
        echo "No Gemfile, yarn.lock, or package-lock.json file found"
    end
end
