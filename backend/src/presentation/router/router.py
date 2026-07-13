import logging
from fastapi import APIRouter, HTTPException, Request

from core.service.fonte_principal_service import FontePrincipalService
from presentation.controller.fonte_principal_controller import FontePrincipalController


log = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


def get_fonte_principal_controller(db_client):
    service = FontePrincipalService(db_client)
    return FontePrincipalController(service)


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/fonteprincipal")
@router.get("/fonte_principal")
async def read_fonte_principal(request: Request):
    try:
        log.debug("Received request for fonte principal list")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.read_fonte_principal()
        log.info("Fonte principal list retrieved successfully")
        return response
    except Exception as exc:
        log.exception("Failed to fetch fonte principal list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching fonte principal.",
        ) from exc