#!/bin/sh

RED='\033[1;31m'
LIGHT_RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[1;34m'
GRAY='\033[90m'
NC='\033[0m'

printf "${BLUE}\n--------------------------------------\n"
printf "\nConfigurando o Google Apps Script\n"
printf "\n--------------------------------------\n\n${NC}"

printf "${GRAY}# Na sua Google Sheets clique em Extensoes -> Apps Script ->\n"
printf "Configuracoes do projeto (no menu lateral esquerdo) -> Codigo do script (ID)${NC}\n"

# Substituído read -p por printf + read comum para garantir compatibilidade com /bin/sh
printf "${GREEN}Digite agora o ID do seu projeto: ${NC}"
read scriptId

if [ -z "$scriptId" ]; then
    printf "${RED}Erro: o Script Id nao pode ser vazio.${NC}\n"
    exit 1
fi

echo "{
    \"scriptId\":\"$scriptId\",
    \"rootDir\":\"./src\"
}" > app/.clasp.json

printf "\n${BLUE}Fazendo login no google${NC}\n"
clasp login --redirect-port 3000

printf "\n\n${BLUE}[SISTEMA] Injetando estrategia do servico escolhido${NC}\n"

. "$1"

printf "\n${BLUE}[SISTEMA] Iniciando envio aos servidores do Google${NC}\n"

OUTPUT=$(clasp push -f 2>&1)

if [ $? -ne 0 ]; then
    printf "\n${RED}Ocorreu um ERRO ao tentar enviar os arquivos!${NC}\n\n"
    
    if echo "$OUTPUT" | grep -q "Invalid ID"; then
        printf "${RED}Diagnóstico: ${LIGHT_RED}O Script ID que você digitou é inválido.${NC}\n"
        printf "${RED}Solução: ${LIGHT_RED}Abra seu Apps Script, vá na Engrenagem e copie o ID novamente.${NC}\n"
        
    elif echo "$OUTPUT" | grep -q "User access denied"; then
        printf "${RED}Diagnóstico: ${LIGHT_RED}A sua conta não tem permissão para editar essa planilha.${NC}\n"
        printf "${RED}Solução: ${LIGHT_RED}Você autorizou o aplicativo com a conta Google correta?${NC}\n"
        
    elif echo "$OUTPUT" | grep -q "Syntax error"; then
        printf "${RED}Diagnóstico: ${LIGHT_RED}Existe um erro de sintaxe no código (falta de vírgula ou chaves).${NC}\n"
        printf "${RED}Solução: ${LIGHT_RED}Verifique se os arquivos JSON e JS estão perfeitamente formatados.${NC}\n"
        
    elif echo "$OUTPUT" | grep -q "No credentials"; then
        printf "${RED}Diagnóstico: ${LIGHT_RED}O seu login falhou lá na primeira etapa.${NC}\n"
        printf "${RED}Solução: ${LIGHT_RED}Lembre-se de copiar a URL inteira da página de erro Localhost e colar aqui.${NC}\n"
        
    else
        printf "${RED}Diagnóstico desconhecido. Veja a resposta técnica do Google abaixo:${NC}\n"
        printf "------------------------------------------------\n"
        printf "%s\n" "$OUTPUT"
        printf "------------------------------------------------\n"
    fi

    exit 1

else
  printf "\n${GREEN}Os codigos foram enviados com sucesso${NC}\n"

fi
