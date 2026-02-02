#!/usr/bin/env bash
# generates secrets.env

echo '# API_URL=http://localhost:3001/graphql'
echo '# REST_API_URL=http://localhost:3001/api/v2/'

export AWS_PROFILE=mpdx-amplify
(aws sts get-caller-identity || aws sso login) > /dev/null 2>&1 &&
aws amplify get-app --app-id d3dytjb8adxkk5 | jq --raw-output '
  .app.environmentVariables |
  to_entries |
  .[] |
  select(.key | IN(
    "CROWDIN_API_TOKEN",
    "GOOGLE_MAPS_API_KEY",
    "HELPJUICE_CATEGORY_ID",
    "HELPJUICE_KNOWLEDGE_BASE_URL",
    "HELPJUICE_ORIGIN",
    "HELPJUICE_PARENT_CATEGORY",
    "HELPJUICE_SUBDOMAIN",
    "HELP_URL_COACHING_ACTIVITY",
    "HELP_URL_COACHING_APPOINTMENTS_AND_RESULTS",
    "HELP_URL_SETUP_FIND_ORGANIZATION",
    "HELP_WHATS_NEW_IMAGE_URL",
    "HELP_WHATS_NEW_URL",
    "NEXT_PUBLIC_MEDIA_FAVICON",
    "NEXT_PUBLIC_MEDIA_LOGO",
    "OKTA_CLIENT_SECRET",
    "TERMS_OF_USE_URL"
  )) |
  "\(.key)=\(.value)"
'
