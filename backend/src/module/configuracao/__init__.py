from .domain.model import ConfiguracaoSave
from .domain.service import ConfiguracaoService, ValidacaoError
from .presentation.controller import ConfiguracaoController
from .repository import ConfiguracaoRepository


class ConfiguracaoFacade:
    model = ConfiguracaoSave
    repository = ConfiguracaoRepository
    service = ConfiguracaoService
    controller = ConfiguracaoController
    validation_error = ValidacaoError

    def __init__(self):
        from .presentation.router import router

        self.router = router

    @staticmethod
    def create_repository(db_client):
        return ConfiguracaoRepository(db_client)

    def create_controller(self, db_client):
        repository = self.create_repository(db_client)
        service = ConfiguracaoService(repository)
        return ConfiguracaoController(service)



__all__ = ["ConfiguracaoFacade"]