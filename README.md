# Spamador de E-mails

Um projeto baseado em Google Apps Script para envio automatizado de e-mails em massa diretamente de planilhas do Google Sheets. O projeto inclui uma interface de barra lateral personalizada e suporte para inserção de variáveis dinâmicas no corpo da mensagem, anexos automatizados e filtros de segurança.

## Funcionalidades Principais

* **Envio em Lote:** Dispara e-mails em massa lendo os dados diretamente das linhas configuradas na planilha.
* **Mensagens Dinâmicas:** Personalização de mensagens para cada destinatário utilizando variáveis.
* **Anexos em PDF:** Permite anexar arquivos armazenados no Google Drive através do ID do arquivo, com conversão automática para PDF.
* **Suporte a HTML:** O corpo do e-mail suporta quebras de linha e formatações básicas em HTML.
* **Controle de Status:** O script marca as linhas que já foram enviadas com sucesso e destaca as linhas com falhas, evitando disparos duplicados em execuções futuras.

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

### 4. Executando na Planilha e Dica de Acesso

Após a instalação, o menu **Automações** ficará disponível no cabeçalho da planilha:

* **Recomendação Essencial (Aba Anônima):** Para abrir e executar o script diretamente na planilha, **recomenda-se fortemente utilizar uma Aba Anônima no navegador** (logando exclusivamente na conta dona ou editora da planilha). O Google Apps Script frequentemente apresenta falhas de permissão, problemas de cookies e bloqueios de execução quando o navegador possui múltiplas contas Google conectadas na mesma sessão.
* **Autorização Inicial:** Ao executar a ferramenta pela primeira vez, o Google exigirá uma autorização de permissões padrão. Clique em **Avançado** -> **Acessar projeto (não seguro)** e permita o acesso para que ele possa gerenciar os e-mails e ler as linhas da planilha.

## Como configurar o ambiente e fazer o Deploy (Docker)

O projeto utiliza Docker e Clasp para garantir um ambiente isolado. Isso permite que a instalação do código na nuvem do Google seja feita sem necessidade de instalar Node.js ou lidar com dependências na sua máquina.

### Arquitetura de Serviços
O sistema possui 3 serviços diferentes dependendo da sua necessidade:

1. **`clone-project` (Biblioteca / Auto-renovável):** Envia apenas a ponte de conexão. O código real fica hospedado em uma Biblioteca Central e se auto-atualiza.
   ```bash
   docker compose run --rm --service-ports clone-project
   ```

2. **`clone-this-repository` (Clone Fixo Local):** Envia exatamente os arquivos de código pesado que estão na sua máquina no momento, criando uma cópia estática e independente.
   ```bash
   docker compose run --rm --service-ports clone-this-repository
   ```

3. **`clone-repository` (Clone Fixo da Nuvem):** Baixa a versão oficial e mais recente diretamente do GitHub oficial e envia para o Apps Script, ignorando possíveis arquivos velhos do seu computador.
   ```bash
   docker compose run --rm --service-ports clone-repository
   ```

### Passo a Passo de Instalação

**Pré-requisito (Apenas na primeira vez):** Você precisa habilitar a API do Google Apps Script na sua conta Google. Acesse [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings) e certifique-se de que a opção **Google Apps Script API** está **LIGADA (ON)**.

1. Na planilha alvo do Google Sheets, navegue pelo menu superior em **Extensões -> Apps Script**.
2. No painel do Apps Script, clique no ícone de engrenagem (**Configurações do projeto**) no menu lateral esquerdo e copie o **Código do script (ID)**.
3. Abra o terminal na raiz do projeto e execute **um** dos comandos de serviço (lembre-se da flag de rede), por exemplo: `docker compose run --rm --service-ports clone-this-repository`.
4. O assistente solicitará o ID do Script. Cole o ID copiado no passo 2.
5. A ferramenta irá gerar e exibir uma URL de autorização no terminal.
6. Clique no link gerado (geralmente segurando `Ctrl` ou `Cmd`) para abrir no seu navegador. Efetue o login com a conta Google dona da planilha e permita os acessos.
7. Ao final da autorização, o Google redirecionará você para uma página `localhost` exibindo a mensagem **"Logged in! You may close this page."**. Isso confirma que o seu navegador enviou a aprovação com sucesso para dentro do Docker! Pode fechar a aba.
8. Retorne ao terminal. Ele já terá capturado a autorização automaticamente, assumirá o controle e finalizará o envio (push) dos códigos com tratamento de erros.

Após a mensagem de sucesso verde no terminal, basta recarregar a página da planilha e o menu **Automações** estará disponível no topo para utilização.

