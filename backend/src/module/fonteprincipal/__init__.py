from .domain.model import (
    AtendimentoConsumidorCreate,
    ContatoTecnicoCreate,
    FontePrincipalCreate,
    IdentificacaoCreate,
    PessoaAutorizadaCreate,
)
from .domain.service import FontePrincipalService, ValidacaoError as FontePrincipalValidacaoError
from .presentation.controller import FontePrincipalController
from .repository import FontePrincipalRepository


class FontePrincipalFacade:
    model = FontePrincipalCreate
    repository = FontePrincipalRepository
    service = FontePrincipalService
    controller = FontePrincipalController
    validation_error = FontePrincipalValidacaoError

    def __init__(self):
        from .presentation.router import router

        self.router = router

    @staticmethod
    def create_repository(db_client):
        return FontePrincipalRepository(db_client)

    def create_controller(self, db_client):
        repository = self.create_repository(db_client)
        from module.endereco.domain.service import EnderecoService

        service = FontePrincipalService(repository, EnderecoService(db_client))
        return FontePrincipalController(service)


__all__ = ["FontePrincipalFacade"]
