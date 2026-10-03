#!/bin/sh

echo "Configurando o Google Apps Script"
echo

echo "Na sua Google Sheets clique em Extensoes -> Apps Script ->"
echo "Configuracoes do projeto (no menu lateral esquerdo) -> Codigo do script (ID)"

# Substituído read -p por printf + read comum para garantir compatibilidade com /bin/sh
printf "Digite agora o ID do seu projeto: "
read scriptId

if [ -z "$scriptId" ]; then
    echo "Erro: o Script Id nao pode ser vazio."
    exit 1
fi

# Corrigido o "rootDir" dentro do JSON
echo "{\"scriptId\":\"$scriptId\", \"rootDir\":\".\"}" > .clasp.json
echo "Arquivo .clasp.json criado."

printf "\nFazendo login no google\n"
clasp login --no-localhost

printf "\nEnviando codigo planilha...\n"
clasp push -f

printf "\nCodigo enviado para planilha com sucesso\n"

