import logging
from fastapi import APIRouter

from presentation.router.endereco import router as endereco_router
from presentation.router.fonteprincipal import router as fonte_principal_router
from presentation.router.produto import router as produto_router
from presentation.router.modalidade import router as modalidade_router
from presentation.router.acpo109 import router as acpo109_router
from presentation.router.configuracao import router as configuracao_router


log = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    return {"status": "ok"}


router.include_router(fonte_principal_router)
router.include_router(endereco_router)
router.include_router(produto_router)
router.include_router(modalidade_router)
router.include_router(acpo109_router)
router.include_router(configuracao_router)