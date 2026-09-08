from .domain.model import ProdutoCreate, ProdutoUpdate
from .domain.service import ProdutoService, ValidacaoError as ProdutoValidacaoError
from .presentation.controller import ProdutoController
from .repository import ProdutoRepository


class ProdutoFacade:
    model = ProdutoCreate
    update_model = ProdutoUpdate
    repository = ProdutoRepository
    service = ProdutoService
    controller = ProdutoController
    validation_error = ProdutoValidacaoError

    def __init__(self):
        from .presentation.router import router

        self.router = router

    @staticmethod
    def create_repository(db_client):
        return ProdutoRepository(db_client)

    def create_controller(self, db_client):
        repository = self.create_repository(db_client)
        service = ProdutoService(repository)
        return ProdutoController(service)


__all__ = ["ProdutoFacade"]
