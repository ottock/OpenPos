from fastapi import FastAPI

from core.log.base import setup_logger
from backend.src.presentation.router.fonteprincipal import router


setup_logger()

app = FastAPI(title="OpenPosBackend")
app.include_router(router)