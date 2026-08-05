import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parent / "postgres" / "query"


class ModalidadeRepository:
    def __init__(self, db_client):
        self.db_client = db_client
        self._modalidade_dir = QUERY_ROOT / "modalidade"


    def _run(self, query_path, params=None):
        return self.db_client.execute_query_path(str(query_path), params)


    def _run_one(self, query_path, params=None):
        result = self._run(query_path, params)
        return result[0] if result else None


    def insert_modalidade(self, modalidade):
        params = (
            modalidade["nome"],
            modalidade.get("descricao"),
            modalidade["tipo_reporte"],
        )
        return self._run_one(self._modalidade_dir / "create_modalidade.sql", params)


    def select_modalidade(self):
        return self._run(self._modalidade_dir / "read_modalidade.sql")


    def update_modalidade(self, modalidade_id, modalidade):
        params = (
            modalidade["nome"],
            modalidade.get("descricao"),
            modalidade["tipo_reporte"],
            modalidade_id,
        )
        return self._run_one(self._modalidade_dir / "update_modalidade.sql", params)


    def delete_modalidade(self, modalidade_id):
        return self._run_one(self._modalidade_dir / "delete_modalidade.sql", (modalidade_id,))
