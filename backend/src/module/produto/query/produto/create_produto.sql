INSERT INTO cadpos.Produtos (
	ModalidadeId,
	Codigo,
	Nome,
	Ativo
)
VALUES (
	%s,
	%s,
	%s,
	%s
)
ON CONFLICT (Codigo)
DO UPDATE SET
	ModalidadeId = EXCLUDED.ModalidadeId,
	Nome = EXCLUDED.Nome,
	Ativo = EXCLUDED.Ativo
RETURNING
	Id AS id,
	ModalidadeId AS modalidade_id,
	Codigo AS codigo,
	Nome AS nome,
	Ativo AS ativo;
