INSERT INTO cadpos.Modalidades (
	Nome,
	Descricao,
	TipoReporte
)
VALUES (
	%s,
	%s,
	%s
)
RETURNING
	Id AS id,
	Nome AS nome,
	Descricao AS descricao,
	TipoReporte AS tipo_reporte;
