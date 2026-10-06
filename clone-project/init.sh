#!/bin/sh

printf "\nPreparando arquivos da biblioteca\n"

echo "{
    \"scriptId\":\"$scriptId\",
    \"rootDir\":\".\"
}" > /app/clone-project/.clasp.json

cd /app/clone-project

printf "\nEnviando codigo para seu projeto, sempre atualizado...\n"
