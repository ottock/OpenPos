import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from core.service.fonte_principal_service import FontePrincipalService
from core.service.endereco_service import EnderecoService
from presentation.controller.fonte_principal_controller import FontePrincipalController
from presentation.controller.endereco_controller import EnderecoController


log = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


class FontePrincipalCreate(BaseModel):
    cnpj: str
    nome_completo: str
    tipo: str = "OUTRO"
    endereco_id: int
    telefone_id: Optional[int] = None
    url_site: Optional[str] = None


class EnderecoCreate(BaseModel):
    cep: str
    logradouro: str
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: str
    municipio: str
    uf: str


def get_fonte_principal_controller(db_client):
    service = FontePrincipalService(db_client)
    return FontePrincipalController(service)


def get_endereco_controller(db_client):
    service = EnderecoService(db_client)
    return EnderecoController(service)


@router.get("/health")
async def health_check():
    return {"status": "ok"}



@router.post("/fonteprincipal", status_code=201)
@router.post("/fonte_principal", status_code=201)
async def create_fonte_principal(request: Request, fonte_principal: FontePrincipalCreate):
    try:
        log.debug("Received request to create fonte principal")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.create_fonte_principal(fonte_principal.model_dump())
        return response
    except Exception as exc:
        log.exception("Failed to create fonte principal")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating fonte principal.",
        ) from exc


@router.get("/fonteprincipal")
@router.get("/fonte_principal")
async def read_fonte_principal(request: Request):
    try:
        log.debug("Received request for fonte principal list")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.read_fonte_principal()
        return response
    except Exception as exc:
        log.exception("Failed to fetch fonte principal list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching fonte principal.",
        ) from exc


@router.post("/endereco", status_code=201)
async def create_endereco(request: Request, endereco: EnderecoCreate):
    try:
        log.debug("Received request to create endereco")
        controller = get_endereco_controller(request.app.state.db)
        response = controller.create_endereco(endereco.model_dump())
        return response
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
        controller = get_endereco_controller(request.app.state.db)
        response = controller.read_endereco()
        return response
    except Exception as exc:
        log.exception("Failed to fetch endereco list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching endereco.",
        ) from exc