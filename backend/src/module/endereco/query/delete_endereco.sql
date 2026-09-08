DELETE FROM cadpos.Endereco
WHERE Id = %s
RETURNING Id;
