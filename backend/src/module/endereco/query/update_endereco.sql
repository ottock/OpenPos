UPDATE cadpos.Endereco
SET
	CEP = %s,
	Logradouro = %s,
	Numero = %s,
	Complemento = %s,
	Bairro = %s,
	Municipio = %s,
	UF = %s
WHERE Id = %s
RETURNING Id, CEP, Logradouro, Numero, Complemento, Bairro, Municipio, UF;
