import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parents[2] / "repository" / "postgres" / "query"
QUERY_DIR = QUERY_ROOT / "endereco"


class EnderecoService:
    def __init__(self, db_client):
        self.db_client = db_client


    def create_endereco(self, endereco):
        log.debug("Executing endereco create query")
        params = (
            endereco["cep"],
            endereco["logradouro"],
            endereco.get("numero"),
            endereco.get("complemento"),
            endereco["bairro"],
            endereco["municipio"],
            endereco["uf"],
        )
        result = self.db_client.execute_query_path(
            str(QUERY_DIR / "create_endereco.sql"), params
        )
        log.info("Endereco created successfully")
        return result[0] if result else None


    def read_endereco(self):
        log.debug("Executing endereco read query")
        result = self.db_client.execute_query_path(str(QUERY_DIR / "read_endereco.sql"))
        log.info("Endereco list retrieved successfully")
        return result