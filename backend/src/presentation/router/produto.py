import logging
from fastapi import APIRouter, HTTPException, Request

from presentation.controller.base import get_produto_controller
from domain.model.produto import ProdutoCreate, ProdutoUpdate
from domain.service.produto import ValidacaoError


log = logging.getLogger(__name__)
router = APIRouter(tags=["produto"])


@router.post("/produto", status_code=201)
async def create_produto(request: Request, produto: ProdutoCreate):
    try:
        log.debug("Received request to create produto")
        controller = get_produto_controller(request.app.state.db)
        response = controller.create_produto(produto.model_dump())
        return response
    except ValidacaoError as exc:
        log.info("Produto bloqueado por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to create produto")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating produto.",
        ) from exc


@router.get("/produto")
async def read_produto(request: Request):
    try:
        log.debug("Received request for produto list")
        controller = get_produto_controller(request.app.state.db)
        response = controller.read_produto()
        return response
    except Exception as exc:
        log.exception("Failed to fetch produto list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching produto.",
        ) from exc


@router.put("/produto/{produto_id}")
async def update_produto(request: Request, produto_id: int, produto: ProdutoUpdate):
    try:
        log.debug("Received request to update produto %s", produto_id)
        controller = get_produto_controller(request.app.state.db)
        response = controller.update_produto(produto_id, produto.model_dump())
    except ValidacaoError as exc:
        log.info("Produto bloqueado por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to update produto")
        if "duplicate key" in str(exc).lower():
            raise HTTPException(
                status_code=409,
                detail="Já existe outro produto com este código.",
            ) from exc
        raise HTTPException(
            status_code=500,
            detail="Internal error while updating produto.",
        ) from exc

    if not response:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return response


@router.delete("/produto/{produto_id}", status_code=204)
async def delete_produto(request: Request, produto_id: int):
    try:
        log.debug("Received request to delete produto %s", produto_id)
        controller = get_produto_controller(request.app.state.db)
        response = controller.delete_produto(produto_id)
    except Exception as exc:
        log.exception("Failed to delete produto")
        raise HTTPException(
            status_code=500,
            detail="Internal error while deleting produto.",
        ) from exc

    if not response:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return None
