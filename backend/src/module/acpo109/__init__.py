from .domain.model import Acpo109GerarRequest
from .domain.service import Acpo109Service, ValidacaoError as Acpo109ValidacaoError
from .presentation.controller import Acpo109Controller
from .repository import Acpo109Repository


class Acpo109Facade:
    model = Acpo109GerarRequest
    repository = Acpo109Repository
    service = Acpo109Service
    controller = Acpo109Controller
    validation_error = Acpo109ValidacaoError

    def __init__(self):
        from .presentation.router import router

        self.router = router

    @staticmethod
    def create_repository(db_client):
        return Acpo109Repository(db_client)

    def create_controller(self, db_client):
        from module.configuracao import ConfiguracaoFacade
        from module.fonteprincipal import FontePrincipalFacade

        repository = self.create_repository(db_client)
        fonte_principal_repository = FontePrincipalFacade.create_repository(db_client)
        configuracao_repository = ConfiguracaoFacade.create_repository(db_client)
        service = Acpo109Service(
            fonte_principal_repository,
            repository,
            configuracao_repository,
        )
        return Acpo109Controller(service)


__all__ = ["Acpo109Facade"]
