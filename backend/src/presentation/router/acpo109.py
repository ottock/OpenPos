import logging
from fastapi import APIRouter, HTTPException, Request

from presentation.controller.base import get_acpo109_controller
from domain.service.acpo109 import ValidacaoError


log = logging.getLogger(__name__)
router = APIRouter(tags=["acpo109"])


@router.post("/acpo109/gerar", status_code=201)
async def generate_acpo109(request: Request):
    try:
        log.debug("Received request to generate ACPO109")
        controller = get_acpo109_controller(request.app.state.db)
        response = controller.generate()
        return response
    except ValidacaoError as exc:
        log.info("Geração do ACPO109 bloqueada por validação: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to generate ACPO109")
        raise HTTPException(
            status_code=500,
            detail="Internal error while generating ACPO109.",
        ) from exc


@router.get("/acpo109")
async def list_acpo109(request: Request):
    try:
        log.debug("Received request for ACPO109 history list")
        controller = get_acpo109_controller(request.app.state.db)
        response = controller.list_all()
        return response
    except Exception as exc:
        log.exception("Failed to fetch ACPO109 history list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching ACPO109 history.",
        ) from exc


@router.delete("/acpo109", status_code=204)
async def reset_acpo109(request: Request):
    try:
        log.debug("Received request to reset ACPO109 history")
        controller = get_acpo109_controller(request.app.state.db)
        response = controller.reset_history()
    except Exception as exc:
        log.exception("Failed to reset ACPO109 history")
        raise HTTPException(
            status_code=500,
            detail="Internal error while resetting ACPO109 history.",
        ) from exc

    if response is False:
        raise HTTPException(status_code=404, detail="No ACPO109 history found to reset.")
    return None
