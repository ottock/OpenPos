from fastapi import FastAPI

from core.log.base import setup_logger
from presentation.router.base import router


setup_logger()

app = FastAPI(title="OpenPosBackend")
app.include_router(router)