#!/bin/sh

printf "\nPreparando arquivos da biblioteca\n"

cp /app/.clasp.json /app/clone-project/

cd /app/clone-project

printf "\nEnviando codigo para seu projeto, sempre atualizado...\n"
clasp push -f

printf "\nCodigo enviado com sucesso\n"

