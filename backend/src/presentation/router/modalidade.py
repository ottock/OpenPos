import logging
from fastapi import APIRouter, HTTPException, Request

from presentation.controller.base import get_modalidade_controller
from domain.model.modalidade import ModalidadeCreate, ModalidadeUpdate
from domain.service.modalidade import ValidacaoError


log = logging.getLogger(__name__)
router = APIRouter(tags=["modalidade"])


@router.post("/modalidade", status_code=201)
async def create_modalidade(request: Request, modalidade: ModalidadeCreate):
    try:
        log.debug("Received request to create modalidade")
        controller = get_modalidade_controller(request.app.state.db)
        response = controller.create_modalidade(modalidade.model_dump())
        return response
    except ValidacaoError as exc:
        log.info("Modalidade bloqueada por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to create modalidade")
        if "duplicate key" in str(exc).lower():
            raise HTTPException(
                status_code=409,
                detail="Já existe outra modalidade com este nome.",
            ) from exc
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating modalidade.",
        ) from exc


@router.get("/modalidade")
async def read_modalidade(request: Request):
    try:
        log.debug("Received request for modalidade list")
        controller = get_modalidade_controller(request.app.state.db)
        response = controller.read_modalidade()
        return response
    except Exception as exc:
        log.exception("Failed to fetch modalidade list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching modalidade.",
        ) from exc


@router.put("/modalidade/{modalidade_id}")
async def update_modalidade(request: Request, modalidade_id: int, modalidade: ModalidadeUpdate):
    try:
        log.debug("Received request to update modalidade %s", modalidade_id)
        controller = get_modalidade_controller(request.app.state.db)
        response = controller.update_modalidade(modalidade_id, modalidade.model_dump())
    except ValidacaoError as exc:
        log.info("Modalidade bloqueada por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to update modalidade")
        if "duplicate key" in str(exc).lower():
            raise HTTPException(
                status_code=409,
                detail="Já existe outra modalidade com este nome.",
            ) from exc
        raise HTTPException(
            status_code=500,
            detail="Internal error while updating modalidade.",
        ) from exc

    if not response:
        raise HTTPException(status_code=404, detail="Modalidade não encontrada.")
    return response


@router.delete("/modalidade/{modalidade_id}", status_code=204)
async def delete_modalidade(request: Request, modalidade_id: int):
    try:
        log.debug("Received request to delete modalidade %s", modalidade_id)
        controller = get_modalidade_controller(request.app.state.db)
        response = controller.delete_modalidade(modalidade_id)
    except Exception as exc:
        log.exception("Failed to delete modalidade")
        raise HTTPException(
            status_code=500,
            detail="Internal error while deleting modalidade.",
        ) from exc

    if not response:
        raise HTTPException(status_code=404, detail="Modalidade não encontrada.")
    return None
