import logging
from fastapi import APIRouter, Request, Response

from module.acpo109 import Acpo109Facade
from module.configuracao import ConfiguracaoFacade
from module.fonteprincipal import FontePrincipalFacade
from module.modalidade import ModalidadeFacade
from module.produto import ProdutoFacade


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


router.include_router(FontePrincipalFacade().router)
router.include_router(ProdutoFacade().router)
router.include_router(ModalidadeFacade().router)
router.include_router(Acpo109Facade().router)
router.include_router(ConfiguracaoFacade().router)