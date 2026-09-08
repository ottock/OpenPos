UPDATE cadpos.Modalidades
SET
	Nome = %s,
	Descricao = %s,
	TipoReporte = %s
WHERE Id = %s
RETURNING
	Id AS id,
	Nome AS nome,
	Descricao AS descricao,
	TipoReporte AS tipo_reporte;
