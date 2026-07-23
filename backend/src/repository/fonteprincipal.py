import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parent / "postgres" / "query"


class FontePrincipalRepository:
    def __init__(self, db_client):
        self.db_client = db_client
        self._fonte_dir = QUERY_ROOT / "fonteprincipal"
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
            fonte_principal["cnpj"],
            fonte_principal["nome_completo"],
            fonte_principal.get("tipo") or "OUTRO",
            fonte_principal["ispb_fonte"],
            fonte_principal["ispb_cip"],
            fonte_principal["endereco_id"],
            fonte_principal.get("telefone_id"),
            fonte_principal.get("url_site"),
        )
        return self._run_one(self._fonte_dir / "create_fonteprincipal.sql", params)


    def select_fonte_principal(self):
        return self._run(self._fonte_dir / "read_fonteprincipal.sql")


    def select_fonte_principal_by_id(self, fonte_id):
        return self._run_one(self._fonte_dir / "get_fonteprincipal.sql", (fonte_id,))


    def insert_contato_tecnico(self, contato_tecnico):
        params = (
            contato_tecnico["fonte_principal_id"],
            contato_tecnico["nome"],
            contato_tecnico.get("email"),
            contato_tecnico.get("departamento"),
            contato_tecnico.get("cargo"),
            contato_tecnico.get("ddd"),
            contato_tecnico.get("telefone"),
            contato_tecnico.get("ramal"),
        )
        return self._run_one(self._contato_dir / "create_contatotecnico.sql", params)


    def select_contato_tecnico(self):
        return self._run(self._contato_dir / "read_contatotecnico.sql")


    def insert_atendimento_consumidor(self, atendimento_consumidor):
        params = (
            atendimento_consumidor["fonte_principal_id"],
            atendimento_consumidor.get("departamento"),
            atendimento_consumidor.get("email"),
            atendimento_consumidor.get("tipo_telefone"),
            atendimento_consumidor.get("cod_pais"),
            atendimento_consumidor.get("ddd"),
            atendimento_consumidor.get("telefone"),
        )
        return self._run_one(
            self._atendimento_dir / "create_atendimentoconsumidor.sql", params
        )


    def select_atendimento_consumidor(self):
        return self._run(self._atendimento_dir / "read_atendimentoconsumidor.sql")


    def insert_pessoa_autorizada(self, pessoa_autorizada):
        params = (
            pessoa_autorizada["fonte_principal_id"],
            pessoa_autorizada.get("nome"),
            pessoa_autorizada.get("email"),
            pessoa_autorizada.get("cpf"),
            pessoa_autorizada.get("ddd"),
            pessoa_autorizada.get("telefone"),
        )
        return self._run_one(self._pessoa_dir / "create_pessoaautorizada.sql", params)


    def select_pessoa_autorizada(self):
        return self._run(self._pessoa_dir / "read_pessoaautorizada.sql")