INSERT INTO cadpos.AtendimentoConsumidor (
	FontePrincipalId,
	Departamento,
	Email,
	TipoTelefone,
	CodPais,
	DDD,
	Telefone
)
VALUES (
	%s,
	%s,
	%s,
	%s,
	%s,
	%s,
	%s
)
RETURNING
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Departamento AS departamento,
	Email AS email,
	TipoTelefone AS tipo_telefone,
	CodPais AS cod_pais,
	DDD AS ddd,
	Telefone AS telefone;
