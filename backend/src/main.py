import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from core.config import Config
from presentation.api.base import app
from backend.src.core.log.base import setup_logger
from repository.postgres.base import PostgresClient


def main():
    log = setup_logger()
    try:
        config = Config()
        log.info("Starting backend application")
        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        db = PostgresClient(
            host=config.db_host,
            user=config.db_user,
            password=config.db_password,
            port=config.db_port,
            database=config.db_database,
        )
        app.state.db = db
        log.info("Backend initialized successfully")
        uvicorn.run(
            app,
            host=config.api_host,
            port=int(config.api_port),
            log_config=None,
        )
    except Exception:
        log.exception("Failed to start the backend")
        raise



if __name__ == "__main__":
    main()