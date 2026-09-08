SELECT
	Id AS id,
	ModalidadeId AS modalidade_id,
	Codigo AS codigo,
	Nome AS nome,
	Ativo AS ativo
FROM cadpos.Produtos
ORDER BY Id;
