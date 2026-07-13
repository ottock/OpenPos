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


    def list_fonte_principal(self):
        log.debug("Executing fonte principal read query")
        result = self.db_client.execute_query_path(str(QUERY_DIR / "fonteprincipal/read_fonteprincipal.sql"))
        log.info("Fonte principal list retrieved successfully")
        return result