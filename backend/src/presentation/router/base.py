import logging
from fastapi import APIRouter, Request, Response

from presentation.router.endereco import router as endereco_router
from presentation.router.fonteprincipal import router as fonte_principal_router
from presentation.router.produto import router as produto_router
from presentation.router.modalidade import router as modalidade_router
from presentation.router.acpo109 import router as acpo109_router
from module.configuracao import ConfiguracaoFacade


log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check(request: Request, response: Response):
    db_status = "ok"
    db = getattr(request.app.state, "db", None)
    try:
        if db is None:
            raise RuntimeError("Database client not initialized")
        db.execute_query("SELECT 1")
    except Exception:
        log.exception("Health check failed: database is unreachable")
        db_status = "error"

    status = "ok" if db_status == "ok" else "error"
    response.status_code = 200 if status == "ok" else 503
    return {"status": status, "database": db_status}


router.include_router(fonte_principal_router)
router.include_router(endereco_router)
router.include_router(produto_router)
router.include_router(modalidade_router)
router.include_router(acpo109_router)
configuracao_facade = ConfiguracaoFacade()
router.include_router(configuracao_facade.router)