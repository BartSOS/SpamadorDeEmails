class SmapadorEmail
{
  constructor(line_start, line_end, get_email, get_assunto, get_mensagem, get_mensagem_html, get_anexo)
  {
    this.aba = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    this.aba.clearConditionalFormatRules();
    this.dados = this.aba.getDataRange().getValues();
    this.qtd_enviada = 0;
    this.line_start = line_start;
    this.line_end = line_end;
    this.getAssunto = get_assunto;
    this.getMensagem = get_mensagem;
    this.getMensagem_html = get_mensagem_html;
    this.getEmail = get_email;
    this.getAnexo = get_anexo;
  }

  tryGet(funcao, dados, i)
  {
    if (!funcao) return;
    return funcao(dados, i);
  }

  sendEmail(trya, catcha)
  {
    for (var i = this.line_start; i <= this.line_end; i++)
    {
      let isKill = CacheService.getUserCache().get('kill_switch')
      if (isKill) throw new Error("O envio foi cancelado");

      var email = this.tryGet(this.getEmail, this.dados, i);
      var assunto = this.tryGet(this.getAssunto, this.dados, i);
      var mensagem = this.tryGet(this.getMensagem, this.dados, i);
      var mensagem_html = this.tryGet(this.getMensagem_html, this.dados, i);
      var anexo;
      
      if (this.getAnexo)
      {
        anexo = this.getAnexo(this.dados, i, this.aba);
      }

      if (!email || (this.getAnexo && !anexo)) continue;

      if (mensagem !== "" && mensagem)
      {
        try
        {
          if (anexo)
            GmailApp.sendEmail(email, assunto, mensagem, {htmlBody : mensagem_html, "attachments" : [anexo]});
          else
            GmailApp.sendEmail(email, assunto, mensagem, {htmlBody : mensagem_html});

          this.qtd_enviada++;
          trya && trya(this.aba, i);
        }

        catch(erro)
        {
          catcha && catcha(erro, this.aba, i);
        }

      }
    }
  }

  getLimite()
  {
    var limite = MailApp.getRemainingDailyQuota();
    console.log("Voce ainda tem " + limite + " emails para enviar hoje!\n");
  }

  imprimeQtd()
  {
    console.log("Quantidade emails enviados nessa tentativa: " + this.qtd_enviada);
  }

  getQtd()
  {
    return this.qtd_enviada;
  }

  getDados()
  {
    return this.dados;
  }
}




