
function valida_line(line)
{
  return line - 1
}

function valida_coluna(coluna)
{
  if (!coluna) return undefined;

  coluna = coluna.toUpperCase();

  var col = 0;

  for (let i = 0; i < coluna.length; i++)
    col = col * 26 + (parseInt(coluna.charCodeAt(i)) - 64)

  return col - 1;
}

function valida_personalize(dados, i, coluna)
{
  if (coluna === undefined || coluna === null) return undefined;

  return dados[i][coluna];
}