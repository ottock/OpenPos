import logging
from fastapi import APIRouter, HTTPException, Request

from presentation.controller.base import get_execucao_controller
from domain.model.execucao import ExecucaoCreate
from domain.service.errors import ValidacaoExecucaoError


log = logging.getLogger(__name__)
router = APIRouter(tags=["execucao"])


@router.post("/execucoes", status_code=201)
async def executar_execucao(request: Request, execucao: ExecucaoCreate):
    try:
        log.debug("Received request to run execucao (layout=%s)", execucao.layout)
        controller = get_execucao_controller(request.app.state.db)
        response = controller.executar(execucao.model_dump())
        return response
    except ValidacaoExecucaoError as exc:
        log.info("Execucao bloqueada por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to run execucao")
        raise HTTPException(
            status_code=500,
            detail="Internal error while running the execution.",
        ) from exc


@router.get("/execucoes")
async def listar_execucoes(request: Request):
    try:
        log.debug("Received request for execucoes list")
        controller = get_execucao_controller(request.app.state.db)
        response = controller.listar()
        return response
    except Exception as exc:
        log.exception("Failed to fetch execucoes list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching execucoes.",
        ) from exc
