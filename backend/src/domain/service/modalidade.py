import logging

from pattern.retry import linear_retry


log = logging.getLogger(__name__)


class ModalidadeService:
    def __init__(self, repository):
        self.repository = repository

    @linear_retry()
    def create_modalidade(self, modalidade):
        result = self.repository.insert_modalidade(modalidade)
        log.info("Modalidade created successfully")
        return result


    def read_modalidade(self):
        return self.repository.select_modalidade()


    def update_modalidade(self, modalidade_id, modalidade):
        result = self.repository.update_modalidade(modalidade_id, modalidade)
        if result:
            log.info("Modalidade updated successfully")
        return result


    def delete_modalidade(self, modalidade_id):
        result = self.repository.delete_modalidade(modalidade_id)
        if result:
            log.info("Modalidade deleted successfully")
        return result
