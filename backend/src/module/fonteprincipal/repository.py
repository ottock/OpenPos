from pathlib import Path


QUERY_ROOT = Path(__file__).resolve().parent / "query"
ENDERECO_QUERY_ROOT = Path(__file__).resolve().parents[1] / "endereco" / "query"


class FontePrincipalRepository:
	def __init__(self, db_client):
		self.db_client = db_client
		self._fonte_dir = QUERY_ROOT / "fonteprincipal"
		self._endereco_dir = ENDERECO_QUERY_ROOT
		self._contato_dir = QUERY_ROOT / "contatotecnico"
		self._atendimento_dir = QUERY_ROOT / "atendimentoconsumidor"
		self._pessoa_dir = QUERY_ROOT / "pessoaautorizada"

	def _run(self, query_path, params=None):
		return self.db_client.execute_query_path(str(query_path), params)

	def _run_one(self, query_path, params=None):
		result = self._run(query_path, params)
		return result[0] if result else None

	def insert_fonte_principal(self, fonte_principal):
		params = (
			fonte_principal["cnpj"], fonte_principal["nome_completo"],
			fonte_principal.get("tipo") or "OUTRO", fonte_principal["ispb_fonte"],
			fonte_principal["ispb_cip"], fonte_principal["endereco_id"],
			fonte_principal.get("telefone_id"), fonte_principal.get("url_site"),
		)
		return self._run_one(self._fonte_dir / "create_fonteprincipal.sql", params)

	def select_fonte_principal(self):
		return self._run(self._fonte_dir / "read_fonteprincipal.sql")

	def select_fonte_principal_by_id(self, fonte_id):
		return self._run_one(self._fonte_dir / "get_fonteprincipal.sql", (fonte_id,))

	def insert_endereco(self, endereco):
		params = tuple(endereco.get(campo) for campo in ("cep", "logradouro", "numero", "complemento", "bairro", "municipio", "uf"))
		return self._run_one(self._endereco_dir / "create_endereco.sql", params)

	def select_endereco(self):
		return self._run(self._endereco_dir / "read_endereco.sql")

	def insert_contato_tecnico(self, contato_tecnico):
		params = tuple(contato_tecnico.get(campo) for campo in ("fonte_principal_id", "nome", "email", "departamento", "cargo", "ddd", "telefone", "ramal"))
		return self._run_one(self._contato_dir / "create_contatotecnico.sql", params)

	def update_contato_tecnico(self, contato_tecnico_id, contato_tecnico):
		params = tuple(contato_tecnico.get(campo) for campo in ("fonte_principal_id", "nome", "email", "departamento", "cargo", "ddd", "telefone", "ramal")) + (contato_tecnico_id,)
		return self._run_one(self._contato_dir / "update_contatotecnico.sql", params)

	def select_contato_tecnico(self):
		return self._run(self._contato_dir / "read_contatotecnico.sql")

	def insert_atendimento_consumidor(self, atendimento_consumidor):
		params = tuple(atendimento_consumidor.get(campo) for campo in ("fonte_principal_id", "departamento", "email", "tipo_telefone", "cod_pais", "ddd", "telefone"))
		return self._run_one(self._atendimento_dir / "create_atendimentoconsumidor.sql", params)

	def update_atendimento_consumidor(self, atendimento_consumidor_id, atendimento_consumidor):
		params = tuple(atendimento_consumidor.get(campo) for campo in ("fonte_principal_id", "departamento", "email", "tipo_telefone", "cod_pais", "ddd", "telefone")) + (atendimento_consumidor_id,)
		return self._run_one(self._atendimento_dir / "update_atendimentoconsumidor.sql", params)

	def select_atendimento_consumidor(self):
		return self._run(self._atendimento_dir / "read_atendimentoconsumidor.sql")

	def insert_pessoa_autorizada(self, pessoa_autorizada):
		params = tuple(pessoa_autorizada.get(campo) for campo in ("fonte_principal_id", "nome", "email", "cpf", "ddd", "telefone"))
		return self._run_one(self._pessoa_dir / "create_pessoaautorizada.sql", params)

	def update_pessoa_autorizada(self, pessoa_autorizada_id, pessoa_autorizada):
		params = tuple(pessoa_autorizada.get(campo) for campo in ("fonte_principal_id", "nome", "email", "cpf", "ddd", "telefone")) + (pessoa_autorizada_id,)
		return self._run_one(self._pessoa_dir / "update_pessoaautorizada.sql", params)

	def select_pessoa_autorizada(self):
		return self._run(self._pessoa_dir / "read_pessoaautorizada.sql")


__all__ = ["FontePrincipalRepository"]
