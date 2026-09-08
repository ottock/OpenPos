UPDATE cadpos.AtendimentoConsumidor
SET
	FontePrincipalId = %s,
	Departamento = %s,
	Email = %s,
	TipoTelefone = %s,
	CodPais = %s,
	DDD = %s,
	Telefone = %s
WHERE Id = %s
RETURNING
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Departamento AS departamento,
	Email AS email,
	TipoTelefone AS tipo_telefone,
	CodPais AS cod_pais,
	DDD AS ddd,
	Telefone AS telefone;