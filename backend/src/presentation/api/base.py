from fastapi import FastAPI

from core.log.base import setup_logger
from presentation.router.fonteprincipal_router import router


setup_logger()

app = FastAPI(title="OpenPosBackend")
app.include_router(router)