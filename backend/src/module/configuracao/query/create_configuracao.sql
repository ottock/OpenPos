INSERT INTO cadpos.Configuracao (
	DiretorioSalvamento
)
VALUES (
	%s
)
RETURNING
	Id AS id,
	DiretorioSalvamento AS diretorio_salvamento,
	AtualizadoEm AS atualizado_em;
