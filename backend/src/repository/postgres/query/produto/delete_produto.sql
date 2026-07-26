DELETE FROM cadpos.Produtos
WHERE Id = %s
RETURNING Id AS id;
