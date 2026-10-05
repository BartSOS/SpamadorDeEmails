// 1. Cria um menu personalizado quando a planilha for aberta
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Automações')
    .addItem('🤖Configurar Script', 'openBarraLateral')
    .addToUi();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function openBarraLateral() {
  // Mudou de createHtmlOutputFromFile para createTemplateFromFile().evaluate()
  var html = HtmlService.createTemplateFromFile('BarraLateral').evaluate()
      .setTitle('Configurações')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}