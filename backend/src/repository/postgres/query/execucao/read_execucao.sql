SELECT
	Id AS id,
	Layout AS layout,
	Parametros AS parametros,
	NomeArquivo AS nome_arquivo,
	ConteudoArquivo AS conteudo_arquivo,
	CriadoEm AS criado_em
FROM cadpos.Execucao
ORDER BY Id DESC;
