SELECT
	Id AS id,
	DiretorioSalvamento AS diretorio_salvamento,
	AtualizadoEm AS atualizado_em
FROM cadpos.Configuracao
ORDER BY Id DESC
LIMIT 1;
