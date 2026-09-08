UPDATE cadpos.FontePrincipal
SET
	CNPJ = %s,
	NomeCompleto = %s,
	Tipo = %s,
	EnderecoId = %s,
	TelefoneId = %s,
	UrlSite = %s
WHERE Id = %s
RETURNING
	Id AS id,
	CNPJ AS cnpj,
	NomeCompleto AS nome_completo,
	Tipo AS tipo,
	EnderecoId AS endereco_id,
	TelefoneId AS telefone_id,
	UrlSite AS url_site;
