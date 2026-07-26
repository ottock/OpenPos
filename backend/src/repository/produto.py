import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parent / "postgres" / "query"


class ProdutoRepository:
    def __init__(self, db_client):
        self.db_client = db_client
        self._produto_dir = QUERY_ROOT / "produto"


    def _run(self, query_path, params=None):
        return self.db_client.execute_query_path(str(query_path), params)


    def _run_one(self, query_path, params=None):
        result = self._run(query_path, params)
        return result[0] if result else None


    def insert_produto(self, produto):
        params = (
            produto.get("modalidade_id"),
            produto["codigo"],
            produto["nome"],
            produto.get("ativo", True),
        )
        return self._run_one(self._produto_dir / "create_produto.sql", params)


    def select_produto(self):
        return self._run(self._produto_dir / "read_produto.sql")


    def update_produto(self, produto_id, produto):
        params = (
            produto.get("modalidade_id"),
            produto["codigo"],
            produto["nome"],
            produto.get("ativo", True),
            produto_id,
        )
        return self._run_one(self._produto_dir / "update_produto.sql", params)


    def delete_produto(self, produto_id):
        return self._run_one(self._produto_dir / "delete_produto.sql", (produto_id,))