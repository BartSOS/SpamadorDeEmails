# Spamador de E-mails

Um projeto baseado em Google Apps Script para envio automatizado de e-mails em massa diretamente de planilhas do Google Sheets. O projeto inclui uma interface de barra lateral personalizada e suporte para inserção de variáveis dinâmicas no corpo da mensagem, anexos automatizados e filtros de segurança.

## Funcionalidades Principais

* **Envio em Lote:** Dispara e-mails em massa lendo os dados diretamente das linhas configuradas na planilha.
* **Mensagens Dinâmicas:** Personalização de mensagens para cada destinatário utilizando variáveis.
* **Anexos em PDF:** Permite anexar arquivos armazenados no Google Drive através do ID do arquivo, com conversão automática para PDF.
* **Suporte a HTML:** O corpo do e-mail suporta quebras de linha e formatações básicas em HTML.
* **Controle de Status (Anti-Spam):** O script marca as linhas que já foram enviadas com sucesso e destaca as linhas com falhas, evitando disparos duplicados em execuções futuras.

## Guia de Operação e Mapeamento de Colunas

O sistema opera atuando como uma esteira de produção: lê a planilha linha por linha dentro do intervalo definido, capta os dados, formata o e-mail único de cada destinatário e realiza o envio. A configuração é feita através de um menu lateral que possui parâmetros obrigatórios e colunas opcionais (variáveis).

### 1. Configurações Obrigatórias

* **Intervalo de Linhas (Início e Fim):** Define o escopo de leitura da planilha. O "Início" geralmente é utilizado para pular o cabeçalho (ex: linha 2), e o "Fim" representa a última linha que deve ser lida.
* **Assunto e Mensagem:** O texto padrão do e-mail. Ao digitar a mensagem, você pode simplesmente pressionar "Enter" no teclado para pular de linha, e o sistema preservará essas quebras de linha automaticamente no corpo do e-mail.
* **Coluna do E-mail:** Informe apenas a letra correspondente à coluna onde estão os endereços de destino (ex: `B`).
* **Coluna Enviados:** O design exige uma coluna dedicada e inicialmente vazia para auditoria. Ao disparar o e-mail com sucesso, a célula correspondente nesta coluna é marcada como verdadeira. O sistema utiliza esta coluna como uma trava de segurança: nenhuma linha que já possua marcação nesta coluna receberá o e-mail novamente em execuções subsequentes.

### 2. Colunas Extras e Variáveis Dinâmicas

No painel lateral, o botão "Adicionar Coluna Extra" permite mapear dados específicos da planilha para variáveis que serão injetadas no Assunto ou na Mensagem. Para usá-las, referencie o nome exato da variável entre chaves duplas:

* **Nome Pessoal:** Desbloqueia a variável `{{nome}}`. Se a coluna de nome for mapeada e contiver "João", o texto `Olá {{nome}}` será substituído por `Olá João`.
* **Nome Equipe:** Desbloqueia a variável `{{nome_equipe}}`.
* **Mensagem Personalizada:** Desbloqueia a variável `{{mensagem}}`. Útil para injetar retornos, links, chaves de acesso ou notas fiscais específicas de uma coluna para o usuário.
* **Confirmação (Filtro de Envio):** Não gera uma variável de texto. Atua como um filtro booleano. Se configurada, o script avaliará esta coluna como um checkbox: o e-mail só será enviado se o conteúdo da célula for avaliado como verdadeiro.
* **ID Anexo:** Exige que a coluna mapeada contenha o ID de um arquivo no Google Drive. Durante a execução, o backend busca o arquivo pelo ID especificado, converte o arquivo obrigatoriamente para PDF (independente do seu formato original, como Docs ou Sheets) e o anexa ao e-mail enviado.

### 3. Tratamento de Erros e Cores

O painel fornece um feedback visual alterando a cor de fundo das células em caso de problemas:

* **Vermelho na Coluna de Anexo:** Significa que o script não conseguiu localizar o arquivo com o ID fornecido ou faltam permissões de acesso naquele documento no Google Drive. O envio para aquela linha é cancelado.
* **Vermelho na Coluna de E-mail:** Indica falha na montagem ou na tentativa de envio para o servidor de e-mail (por exemplo, um e-mail com formato inválido).
* **Fundo Branco:** Quando a linha é processada com sucesso, a célula de e-mail recebe fundo branco e a "Coluna Enviados" é devidamente preenchida com a confirmação.

Para re-executar testes com e-mails já enviados, deve-se apagar o conteúdo da "Coluna Enviados" da respectiva linha, retirando a trava de segurança.

## Como configurar o ambiente (Deploy via Docker)

O projeto utiliza Docker e Clasp para garantir um ambiente isolado. Isso permite que a atualização e o versionamento do código na nuvem do Google sejam feitos sem necessidade de instalar Node.js ou lidar com dependências no ambiente local.

1. Clone este repositório no seu computador.
2. Na planilha alvo do Google Sheets, navegue pelo menu superior em **Extensões -> Apps Script**.
3. No painel do Apps Script, clique no ícone de engrenagem (**Configurações do projeto**) no menu lateral esquerdo e copie o **Código do script (ID)**.
4. Abra o terminal na raiz do repositório clonado e inicie o assistente:
   
   ```bash
   docker compose build && docker compose run --rm setup-planilha
   ```

5. O assistente solicitará o ID do Script. Cole o ID copiado no passo 3.
6. A ferramenta do Clasp irá gerar e exibir uma URL de autorização. Copie esta URL, acesse-a em seu navegador e efetue o login na conta do Google para autorizar os escopos do projeto.
7. Ao final da autorização, o Google redirecionará para uma página `localhost` que falhará em conectar. Isso é o fluxo esperado (Out-Of-Band). **Copie a URL inteira dessa página de falha** na barra de endereços do navegador, retorne ao terminal e cole a URL completa para finalizar a autenticação.
8. O script automatizado concluirá o "push", sobrescrevendo o código em nuvem com os arquivos locais.

Após a conclusão, basta recarregar a página da planilha e o menu **Automações** estará disponível para utilização.

