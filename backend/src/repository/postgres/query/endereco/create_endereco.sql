INSERT INTO cadpos.Endereco (
	CEP,
	Logradouro,
	Numero,
	Complemento,
	Bairro,
	Municipio,
	UF
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
RETURNING Id, CEP, Logradouro, Numero, Complemento, Bairro, Municipio, UF;
