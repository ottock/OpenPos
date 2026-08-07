from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.log.base import setup_logger
from presentation.router.base import router


setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    db = getattr(app.state, "db", None)
    if db is not None:
        db.close()


app = FastAPI(title="OpenPosBackend", lifespan=lifespan)
app.include_router(router)