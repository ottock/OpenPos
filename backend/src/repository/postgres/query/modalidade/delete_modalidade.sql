DELETE FROM cadpos.Modalidades
WHERE Id = %s
RETURNING Id AS id;
