function preview --description 'Open the MPDX preview URL for the current directory\'s pull request'
    open https://pr-$(gh pr view --json number | jq .number).d3dytjb8adxkk5.amplifyapp.com
end
