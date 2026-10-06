var name_equipe = "nome_equipe";
var name_nome = "nome";
var name_anexo = "anexo";
var name_mensagem = "mensagem";

var assunto = "";
var mensagem = "";

var line_start;
var line_end;
var coluna_confirmado;
var coluna_enviado;
var coluna_email;
var coluna_id;
var coluna_nome;
var coluna_nome_equipe;
var coluna_mensagem;

function naoPodeEnviar(dados, i)
{
  return dados[i][coluna_enviado] || (coluna_confirmado && !dados[i][coluna_confirmado])
}

function obtemMensagem(dados, i)
{
  if (naoPodeEnviar(dados, i)) return;

  let obj_personalize = {};
  obj_personalize[name_nome] = valida_personalize(dados, i, coluna_nome);
  obj_personalize[name_equipe] = valida_personalize(dados, i, coluna_nome_equipe);
  obj_personalize[name_anexo] = valida_personalize(dados, i, coluna_id);
  obj_personalize[name_mensagem] = valida_personalize(dados, i, coluna_mensagem);

  return substitue_personalized(mensagem, obj_personalize);
}

function obtemMensagemHtml(dados, i)
{
  if (naoPodeEnviar(dados, i)) return;
 
  let obj_personalize = {};
  obj_personalize[name_nome] = valida_personalize(dados, i, coluna_nome);
  obj_personalize[name_equipe] = valida_personalize(dados, i, coluna_nome_equipe);
  obj_personalize[name_anexo] = valida_personalize(dados, i, coluna_id);
  obj_personalize[name_mensagem] = valida_personalize(dados, i, coluna_mensagem);

  return substitue_personalized(mensagem.replace(/\\n|\n/g, '<br>'), obj_personalize);
}

function obtemAssunto(dados, i)
{
  let obj_personalize = {};
  obj_personalize[name_nome] = valida_personalize(dados, i, coluna_nome);
  obj_personalize[name_equipe] = valida_personalize(dados, i, coluna_nome_equipe);
  obj_personalize[name_anexo] = valida_personalize(dados, i, coluna_id);
  obj_personalize[name_mensagem] = valida_personalize(dados, i, coluna_mensagem);

  return substitue_personalized(assunto, obj_personalize);
}

function obtemAnexo(dados, i, aba)
{
  var id_anexo = valida_personalize(dados, i, coluna_id);

  if (!id_anexo || id_anexo === null) return;

  if (id_anexo.length <= 10) return;

  var anexo = null;
  try
  {
    anexo = DriveApp.getFileById(id_anexo);

    if (anexo.getMimeType() === MimeType.PDF) {
    anexo = anexo.getBlob(); 
    } else {
      anexo = anexo.getAs(MimeType.PDF);
    }
    
    return anexo;
  }
  catch(e)
  {     
    aba.getRange(i + 1, coluna_id + 1).setBackground("red");
    return;
  } 
}

function substitue_personalized(mensagem, dadosDaLinha) {
  // 1. A mensagem que veio do seu HTML
  const mensagemRecebida = mensagem;
  
  // 3. A mágica da substituição
  // O Regex /\{\{(.*?)\}\}/g procura tudo que está entre {{ e }}
  const mensagemPronta = mensagemRecebida.replace(/\{\{(.*?)\}\}/g, function(match, nome_variavel) {
    // Remove espaços em branco por precaução
    const chave = nome_variavel.trim(); 
    
    if (dadosDaLinha[chave] === undefined)
      throw new Error("O nome entre chaves não está no programa, insira entre chaves {{ }} nome, nome_equipe ou mensagem");
    
    return dadosDaLinha[chave];
  });
  
  return mensagemPronta;
}

function abortarAutomacao()
{
  CacheService.getUserCache().put('kill_switch', 'true', 300);
}

function executarAutomacao(dadosDoFormulario) {
  CacheService.getUserCache().remove('kill_switch');

  //obrigatorios
  line_start = valida_line(dadosDoFormulario.line_start);
  line_end = valida_line(dadosDoFormulario.line_end);

  //SpreadsheetApp.getActiveSpreadsheet().toast("start: " + line_start + " end " + line_end);

  coluna_email = valida_coluna(dadosDoFormulario.coluna_email);
  assunto = dadosDoFormulario.assunto;
  mensagem = dadosDoFormulario.mensagem;
  coluna_enviado = valida_coluna(dadosDoFormulario.coluna_enviado);
  
  coluna_confirmado = valida_coluna(dadosDoFormulario.confirmacao);
  coluna_nome = valida_coluna(dadosDoFormulario.nome_pessoal);
  coluna_nome_equipe = valida_coluna(dadosDoFormulario.nome_equipe);
  coluna_id = valida_coluna(dadosDoFormulario.id_anexo);
  coluna_mensagem = valida_coluna(dadosDoFormulario.coluna_mensagem);
  
  let spamador = new SmapadorEmail(line_start, line_end, 
    (dados, i) => {return dados[i][coluna_email]},
    obtemAssunto,
    obtemMensagem,
    obtemMensagemHtml,
    coluna_id ? obtemAnexo : undefined
  );

  spamador.sendEmail(
    (aba, i) => {
      aba.getRange(i + 1, coluna_enviado + 1).setValue(true);
      aba.getRange(i + 1, coluna_email + 1).setBackground("white");
    },
    (erro, aba, i) => {
      aba.getRange(i + 1, coluna_email + 1).setBackground("red");
    }
      
  )

  return "Foram enviados " + spamador.getQtd() + " emails nessa tentativa";
}
