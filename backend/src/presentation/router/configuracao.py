import logging
from fastapi import APIRouter, HTTPException, Request

from presentation.controller.base import get_configuracao_controller
from domain.model.configuracao import ConfiguracaoSave
from domain.service.errors import ValidacaoError


log = logging.getLogger(__name__)
router = APIRouter(tags=["configuracao"])


@router.get("/configuracao")
async def read_configuracao(request: Request):
    try:
        log.debug("Received request for configuracao")
        controller = get_configuracao_controller(request.app.state.db)
        response = controller.read_configuracao()
        return response
    except Exception as exc:
        log.exception("Failed to fetch configuracao")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching configuracao.",
        ) from exc


@router.put("/configuracao")
async def save_configuracao(request: Request, configuracao: ConfiguracaoSave):
    try:
        log.debug("Received request to save configuracao")
        controller = get_configuracao_controller(request.app.state.db)
        response = controller.save_configuracao(configuracao.model_dump())
        return response
    except ValidacaoError as exc:
        log.info("Configuracao bloqueada por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to save configuracao")
        raise HTTPException(
            status_code=500,
            detail="Internal error while saving configuracao.",
        ) from exc
