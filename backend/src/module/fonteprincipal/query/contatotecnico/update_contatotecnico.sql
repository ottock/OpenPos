UPDATE cadpos.ContatoTecnico
SET
	FontePrincipalId = %s,
	Nome = %s,
	Email = %s,
	Departamento = %s,
	Cargo = %s,
	DDD = %s,
	Telefone = %s,
	Ramal = %s
WHERE Id = %s
RETURNING
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Nome AS nome,
	Email AS email,
	Departamento AS departamento,
	Cargo AS cargo,
	DDD AS ddd,
	Telefone AS telefone,
	Ramal AS ramal;