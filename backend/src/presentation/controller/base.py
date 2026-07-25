from domain.service.endereco import EnderecoService
from domain.service.fonteprincipal import FontePrincipalService
from repository.fonteprincipal import FontePrincipalRepository
from presentation.controller.endereco import EnderecoController
from presentation.controller.fonteprincipal import FontePrincipalController


def get_fonte_principal_controller(db_client):
    repository = FontePrincipalRepository(db_client)
    endereco_service = EnderecoService(db_client)
    service = FontePrincipalService(repository, endereco_service)
    return FontePrincipalController(service)


def get_endereco_controller(db_client):
    service = EnderecoService(db_client)
    return EnderecoController(service)