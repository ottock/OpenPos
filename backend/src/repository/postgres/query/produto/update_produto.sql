UPDATE cadpos.Produtos
SET
	ModalidadeId = %s,
	Codigo = %s,
	Nome = %s,
	Ativo = %s
WHERE Id = %s
RETURNING
	Id AS id,
	ModalidadeId AS modalidade_id,
	Codigo AS codigo,
	Nome AS nome,
	Ativo AS ativo;
