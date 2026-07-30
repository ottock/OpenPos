UPDATE cadpos.Configuracao
SET
	DiretorioSalvamento = %s,
	AtualizadoEm = NOW()
WHERE Id = %s
RETURNING
	Id AS id,
	DiretorioSalvamento AS diretorio_salvamento,
	AtualizadoEm AS atualizado_em;
