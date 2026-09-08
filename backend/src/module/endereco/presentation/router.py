import logging
from fastapi import APIRouter, HTTPException, Request

from module.endereco.domain.model import EnderecoCreate
from module.endereco.domain.service import ValidacaoError
from module.endereco.presentation.controller import EnderecoController


log = logging.getLogger(__name__)
router = APIRouter(tags=["endereco"])


def get_controller(db_client):
    from module.endereco.domain.service import EnderecoService

    return EnderecoController(EnderecoService(db_client))


@router.post("/endereco", status_code=201)
async def create_endereco(request: Request, endereco: EnderecoCreate):
    try:
        log.debug("Received request to create endereco")
        controller = get_controller(request.app.state.db)
        response = controller.create_endereco(endereco.model_dump())
        return response
    except ValidacaoError as exc:
        log.info("Endereco bloqueado por validacao: %s", exc)
        raise HTTPException(status_code=422, detail="; ".join(exc.messages)) from exc
    except Exception as exc:
        log.exception("Failed to create endereco")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating endereco.",
        ) from exc


@router.get("/endereco")
async def read_endereco(request: Request):
    try:
        log.debug("Received request for endereco list")
        controller = get_controller(request.app.state.db)
        response = controller.read_endereco()
        return response
    except Exception as exc:
        log.exception("Failed to fetch endereco list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching endereco.",
        ) from exc
