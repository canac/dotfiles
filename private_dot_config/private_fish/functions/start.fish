function start --description 'Start a project'
    portman link
    if test -e yarn.lock
        yarn start
    else if test -e package-lock.json
        npm start
    else
        echo "No yarn.lock or package-lock.json file found"
    end
end
