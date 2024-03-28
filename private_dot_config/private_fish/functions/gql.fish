function gql --description 'Create GraphQL generated files'
    find . -type f -name "*.generated.ts" -delete
    yarn gql
end
