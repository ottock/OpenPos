DELETE FROM cadpos.FontePrincipal
WHERE Id = %s
RETURNING Id AS id;
