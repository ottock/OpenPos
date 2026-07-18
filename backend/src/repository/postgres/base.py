import psycopg2
import logging


log = logging.getLogger(__name__)


class PostgresClient:
    def __init__(self, host: str, user: str, password: str, port: str, database: str):
        self.host = host
        self.user = user
        self.password = password
        self.port = port
        self.database = database
        try:
            self.conn = psycopg2.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                port=self.port,
                dbname=self.database
            )
            self.cursor = self.conn.cursor()
            log.info("Connected to PostgreSQL database %s on %s:%s", self.database, self.host, self.port)
        except Exception as e:
            log.exception("Failed to connect to PostgreSQL database")
            raise RuntimeError(f"Failed to connect to database: {e}")


    def execute_query(self, query: str, params=None):
        try:
            log.debug("Executing SQL query")
            self.cursor.execute(query, params)
            self.conn.commit()
            try:
                rows = self.cursor.fetchall()
                columns = [column[0] for column in self.cursor.description]
                log.debug("Query returned %s rows", len(rows))
                return [dict(zip(columns, row)) for row in rows]
            except psycopg2.ProgrammingError:
                log.debug("Query completed without result set")
                return None
        except Exception as e:
            self.conn.rollback()
            log.exception("Failed to execute SQL query")
            raise RuntimeError(f"Failed to execute query: {e}") from e


    def execute_query_path(self, query_path: str, params=None):
        try:
            with open(query_path, 'r') as file:
                query = file.read()
            return self.execute_query(query, params)
        except Exception as e:
            log.exception("Failed to execute SQL query from path")
            raise RuntimeError(f"Failed to execute query from path: {e}") from e