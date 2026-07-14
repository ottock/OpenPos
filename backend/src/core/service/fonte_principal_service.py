import logging
from pathlib import Path


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parents[2] / "repository" / "postgres" / "query"
QUERY_DIR = QUERY_ROOT / "fonteprincipal"


class FontePrincipalService:
    def __init__(self, db_client):
        self.db_client = db_client


    def _read_query(self, query_path):
        return Path(query_path).read_text(encoding="utf-8")


    def _fetch_one_row(self, cursor):
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, rows[0])) if rows else None


    def create_fonte_principal(self, fonte_principal):
        log.debug("Executing fonte principal create query")
        params = (
            fonte_principal["cnpj"],
            fonte_principal["nome_completo"],
            fonte_principal.get("tipo") or "OUTRO",
            fonte_principal["endereco_id"],
            fonte_principal.get("telefone_id"),
            fonte_principal.get("url_site"),
        )
        result = self.db_client.execute_query_path(
            str(QUERY_DIR / "create_fonteprincipal.sql"), params
        )
        log.info("Fonte principal created successfully")
        return result[0] if result else None


    def read_fonte_principal(self):
        log.debug("Executing fonte principal read query")
        result = self.db_client.execute_query_path(str(QUERY_DIR / "read_fonteprincipal.sql"))
        log.info("Fonte principal list retrieved successfully")
        return result