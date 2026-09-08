SELECT
	Id AS id,
	FontePrincipalId AS fonte_principal_id,
	Nome AS nome,
	Email AS email,
	Departamento AS departamento,
	Cargo AS cargo,
	DDD AS ddd,
	Telefone AS telefone,
	Ramal AS ramal
FROM cadpos.ContatoTecnico
ORDER BY Id;
