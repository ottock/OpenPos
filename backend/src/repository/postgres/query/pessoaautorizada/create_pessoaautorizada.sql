INSERT INTO cadpos.PessoaAutorizada (
	FontePrincipalId,
	Nome,
	Email,
	CPF,
	DDD,
	Telefone
)
VALUES (
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
	Nome AS nome,
	Email AS email,
	CPF AS cpf,
	DDD AS ddd,
	Telefone AS telefone;
