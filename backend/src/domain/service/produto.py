import logging

from core.pattern.retry import linear_retry


log = logging.getLogger(__name__)


class ProdutoService:
    def __init__(self, repository):
        self.repository = repository

    @linear_retry()
    def create_produto(self, produto):
        result = self.repository.insert_produto(produto)
        log.info("Produto created successfully")
        return result


    def read_produto(self):
        return self.repository.select_produto()


    def update_produto(self, produto_id, produto):
        result = self.repository.update_produto(produto_id, produto)
        if result:
            log.info("Produto updated successfully")
        return result


    def delete_produto(self, produto_id):
        result = self.repository.delete_produto(produto_id)
        if result:
            log.info("Produto deleted successfully")
        return result