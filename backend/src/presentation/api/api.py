from fastapi import FastAPI

from core.logger.logger import setup_logger
from presentation.router.router import router


setup_logger()

app = FastAPI(title="OpenPosBackend")
app.include_router(router)