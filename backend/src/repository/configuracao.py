import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parent / "postgres" / "query"


class ConfiguracaoRepository:


    def __init__(self, db_client):
        self.db_client = db_client
        self._configuracao_dir = QUERY_ROOT / "configuracao"


    def _run(self, query_path, params=None):
        return self.db_client.execute_query_path(str(query_path), params)


    def _run_one(self, query_path, params=None):
        result = self._run(query_path, params)
        return result[0] if result else None


    def insert_configuracao(self, configuracao):
        params = (configuracao["diretorio_salvamento"],)
        return self._run_one(self._configuracao_dir / "create_configuracao.sql", params)


    def select_configuracao(self):
        return self._run_one(self._configuracao_dir / "read_configuracao.sql")


    def update_configuracao(self, configuracao_id, configuracao):
        params = (configuracao["diretorio_salvamento"], configuracao_id)
        return self._run_one(self._configuracao_dir / "update_configuracao.sql", params)
