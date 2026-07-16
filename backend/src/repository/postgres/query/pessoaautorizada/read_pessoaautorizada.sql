SELECT
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Nome AS nome,
	Email AS email,
	CPF AS cpf,
	DDD AS ddd,
	Telefone AS telefone
FROM cadpos.PessoaAutorizada
ORDER BY Id;
