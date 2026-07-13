INSERT INTO cadpos.FontePrincipal (
	CNPJ,
	NomeCompleto,
	Tipo,
	EnderecoId,
	TelefoneId,
	UrlSite
)
VALUES (
	%s,
	%s,
	%s,
	%s,
	%s,
	%s
)
ON CONFLICT (CNPJ)
DO UPDATE SET
	NomeCompleto = EXCLUDED.NomeCompleto,
	Tipo = EXCLUDED.Tipo,
	EnderecoId = EXCLUDED.EnderecoId,
	TelefoneId = EXCLUDED.TelefoneId,
	UrlSite = EXCLUDED.UrlSite
RETURNING
	Id AS id,
	CNPJ AS cnpj,
	NomeCompleto AS nome_completo,
	Tipo AS tipo,
	EnderecoId AS endereco_id,
	TelefoneId AS telefone_id,
	UrlSite AS url_site;
