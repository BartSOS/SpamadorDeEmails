#!/bin/sh

printf "\nBaixando a versao mais recente no git hub\n"

git clone https://BartSOS:${GITHUB_TOKEN}@github.com/BartSOS/SpamadorDeEmails.git /tmp/SpamadorNovo

cp /app/.clasp.json /tmp/SpamadorNovo/.clasp.json

cd /tmp/SpamadorNovo

printf "\nEnviando codigo para seu projeto, usando a versao mais nova...\n"
