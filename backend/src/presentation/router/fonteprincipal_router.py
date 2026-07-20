import logging
from fastapi import APIRouter, HTTPException, Request

from domain.service.fonte_principal_service import FontePrincipalService
from domain.service.endereco_service import EnderecoService
from repository.fonte_principal_repository import FontePrincipalRepository
from presentation.controller.fonteprincipal_controller import FontePrincipalController
from presentation.controller.endereco_controller import EnderecoController
from domain.model.endereco_model import EnderecoCreate
from domain.model.fonte_principal_model import (
    AtendimentoConsumidorCreate,
    ContatoTecnicoCreate,
    FontePrincipalCreate,
    IdentificacaoCreate,
    PessoaAutorizadaCreate,
)


log = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


def get_fonte_principal_controller(db_client):
    repository = FontePrincipalRepository(db_client)
    endereco_service = EnderecoService(db_client)
    service = FontePrincipalService(repository, endereco_service)
    return FontePrincipalController(service)


def get_endereco_controller(db_client):
    service = EnderecoService(db_client)
    return EnderecoController(service)


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.post("/fonteprincipal/identificacao", status_code=201)
@router.post("/fonte_principal/identificacao", status_code=201)
async def create_identificacao(request: Request, identificacao: IdentificacaoCreate):
    try:
        log.debug("Received request to create identificacao")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.create_identificacao(identificacao.model_dump())
        return response
    except Exception as exc:
        log.exception("Failed to create identificacao")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating identificacao.",
        ) from exc


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


@router.post("/contatotecnico", status_code=201)
@router.post("/contato_tecnico", status_code=201)
async def create_contato_tecnico(request: Request, contato_tecnico: ContatoTecnicoCreate):
    try:
        log.debug("Received request to create contato tecnico")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.create_contato_tecnico(contato_tecnico.model_dump())
        return response
    except Exception as exc:
        log.exception("Failed to create contato tecnico")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating contato tecnico.",
        ) from exc


@router.get("/contatotecnico")
@router.get("/contato_tecnico")
async def read_contato_tecnico(request: Request):
    try:
        log.debug("Received request for contato tecnico list")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.read_contato_tecnico()
        return response
    except Exception as exc:
        log.exception("Failed to fetch contato tecnico list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching contato tecnico.",
        ) from exc


@router.post("/atendimentoconsumidor", status_code=201)
@router.post("/atendimento_consumidor", status_code=201)
async def create_atendimento_consumidor(request: Request, atendimento_consumidor: AtendimentoConsumidorCreate):
    try:
        log.debug("Received request to create atendimento consumidor")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.create_atendimento_consumidor(atendimento_consumidor.model_dump())
        return response
    except Exception as exc:
        log.exception("Failed to create atendimento consumidor")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating atendimento consumidor.",
        ) from exc


@router.get("/atendimentoconsumidor")
@router.get("/atendimento_consumidor")
async def read_atendimento_consumidor(request: Request):
    try:
        log.debug("Received request for atendimento consumidor list")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.read_atendimento_consumidor()
        return response
    except Exception as exc:
        log.exception("Failed to fetch atendimento consumidor list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching atendimento consumidor.",
        ) from exc


@router.post("/pessoaautorizada", status_code=201)
@router.post("/pessoa_autorizada", status_code=201)
async def create_pessoa_autorizada(request: Request, pessoa_autorizada: PessoaAutorizadaCreate):
    try:
        log.debug("Received request to create pessoa autorizada")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.create_pessoa_autorizada(pessoa_autorizada.model_dump())
        return response
    except Exception as exc:
        log.exception("Failed to create pessoa autorizada")
        raise HTTPException(
            status_code=500,
            detail="Internal error while creating pessoa autorizada.",
        ) from exc


@router.get("/pessoaautorizada")
@router.get("/pessoa_autorizada")
async def read_pessoa_autorizada(request: Request):
    try:
        log.debug("Received request for pessoa autorizada list")
        controller = get_fonte_principal_controller(request.app.state.db)
        response = controller.read_pessoa_autorizada()
        return response
    except Exception as exc:
        log.exception("Failed to fetch pessoa autorizada list")
        raise HTTPException(
            status_code=500,
            detail="Internal error while fetching pessoa autorizada.",
        ) from exc