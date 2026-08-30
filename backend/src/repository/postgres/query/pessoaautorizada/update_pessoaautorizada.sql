UPDATE cadpos.PessoaAutorizada
SET
	FontePrincipalId = %s,
	Nome = %s,
	Email = %s,
	CPF = %s,
	DDD = %s,
	Telefone = %s
WHERE Id = %s
RETURNING
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Nome AS nome,
	Email AS email,
	CPF AS cpf,
	DDD AS ddd,
	Telefone AS telefone;