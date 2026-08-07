import psycopg2
import psycopg2.pool
import logging


log = logging.getLogger(__name__)


class PostgresClient:
    def __init__(self, host: str, user: str, password: str, port: str, database: str, minconn: int = 1, maxconn: int = 10):
        self.host = host
        self.user = user
        self.password = password
        self.port = port
        self.database = database
        try:
            self.pool = psycopg2.pool.ThreadedConnectionPool(
                minconn,
                maxconn,
                host=self.host,
                user=self.user,
                password=self.password,
                port=self.port,
                dbname=self.database,
            )
            log.info(
                "Created PostgreSQL connection pool (min=%s, max=%s) for %s on %s:%s",
                minconn, maxconn, self.database, self.host, self.port,
            )
        except Exception as e:
            log.exception("Failed to create PostgreSQL connection pool")
            raise RuntimeError(f"Failed to create connection pool: {e}")


    def execute_query(self, query: str, params=None):
        conn = self.pool.getconn()
        try:
            log.debug("Executing SQL query")
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                try:
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    log.debug("Query returned %s rows", len(rows))
                    return [dict(zip(columns, row)) for row in rows]
                except psycopg2.ProgrammingError:
                    log.debug("Query completed without result set")
                    return None
        except Exception as e:
            conn.rollback()
            log.exception("Failed to execute SQL query")
            raise RuntimeError(f"Failed to execute query: {e}") from e
        finally:
            self.pool.putconn(conn)


    def close(self):
        self.pool.closeall()
        log.info("Closed PostgreSQL connection pool")


    def execute_query_path(self, query_path: str, params=None):
        try:
            with open(query_path, 'r') as file:
                query = file.read()
            return self.execute_query(query, params)
        except Exception as e:
            log.exception("Failed to execute SQL query from path")
            raise RuntimeError(f"Failed to execute query from path: {e}") from e