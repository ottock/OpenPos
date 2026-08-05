import json
import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parent / "postgres" / "query"


class Acpo109Repository:
    def __init__(self, db_client):
        self.db_client = db_client
        self._execucao_dir = QUERY_ROOT / "execucao"


    def _run(self, query_path, params=None):
        return self.db_client.execute_query_path(str(query_path), params)


    def _run_one(self, query_path, params=None):
        result = self._run(query_path, params)
        return result[0] if result else None


    def insert_execucao(self, execucao):
        params = (
            execucao["layout"],
            json.dumps(execucao["parametros"]),
            execucao["nome_arquivo"],
            execucao["conteudo_arquivo"],
        )
        return self._run_one(self._execucao_dir / "create_execucao.sql", params)


    def select_execucao(self):
        return self._run(self._execucao_dir / "read_execucao.sql")
