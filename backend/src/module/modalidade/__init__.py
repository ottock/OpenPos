from .domain.model import ModalidadeCreate, ModalidadeUpdate
from .domain.service import ModalidadeService, ValidacaoError as ModalidadeValidacaoError
from .presentation.controller import ModalidadeController
from .repository import ModalidadeRepository


class ModalidadeFacade:
    model = ModalidadeCreate
    update_model = ModalidadeUpdate
    repository = ModalidadeRepository
    service = ModalidadeService
    controller = ModalidadeController
    validation_error = ModalidadeValidacaoError

    def __init__(self):
        from .presentation.router import router

        self.router = router

    @staticmethod
    def create_repository(db_client):
        return ModalidadeRepository(db_client)

    def create_controller(self, db_client):
        repository = self.create_repository(db_client)
        service = ModalidadeService(repository)
        return ModalidadeController(service)


__all__ = ["ModalidadeFacade"]
