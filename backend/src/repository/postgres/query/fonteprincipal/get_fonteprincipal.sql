SELECT
    fp.Id AS id,
    fp.CNPJ AS cnpj,
    fp.NomeCompleto AS nome_completo,
    fp.Tipo AS tipo,
    fp.EnderecoId AS endereco_id,
    fp.TelefoneId AS telefone_id,
    fp.UrlSite AS url_site,
    e.CEP AS cep,
    e.Logradouro AS logradouro,
    e.Numero AS numero,
    e.Complemento AS complemento,
    e.Bairro AS bairro,
    e.Municipio AS municipio,
    e.UF AS uf
FROM cadpos.FontePrincipal fp
JOIN cadpos.Endereco e ON e.Id = fp.EnderecoId
WHERE fp.Id = %s;