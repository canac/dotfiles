function copy-ots --description "Create a One Time Secret URL from stdin or clipboard"
    if isatty stdin
        set secret (pbpaste)
    else
        read --null secret
    end

    set domain us
    set body (jq --null-input --arg secret "$secret" '{secret: {kind: "conceal", secret: $secret}}')
    set response (curl --silent --fail-with-body \
        --request POST "https://$domain.onetimesecret.com/api/v2/guest/secret/conceal" \
        --header "Content-Type: application/json" \
        --data "$body")
    or begin
        echo "$response" >&2
        return 1
    end

    set key (echo $response | jq -r '.record.secret.key')
    set url "https://$domain.onetimesecret.com/secret/$key"
    echo $url | pbcopy
    echo "Copied: $url"
end
