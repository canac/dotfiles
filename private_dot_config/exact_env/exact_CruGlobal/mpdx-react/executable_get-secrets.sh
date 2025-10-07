#!/usr/bin/env bash

export AWS_PROFILE=mpdx-amplify
(aws sts get-caller-identity || aws sso login) > /dev/null 2>&1 &&
aws amplify get-app --app-id d3dytjb8adxkk5 | jq --raw-output '.app.environmentVariables | to_entries | .[] | "\(.key)=\(.value)"'
