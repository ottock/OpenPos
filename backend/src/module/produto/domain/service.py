import logging

from core.pattern.retry import linear_retry


log = logging.getLogger(__name__)


class ValidacaoError(Exception):
    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))


CAMPOS_OBRIGATORIOS = {
    "codigo": "Código",
    "nome": "Nome",
}


class ProdutoService:
    def __init__(self, repository):
        self.repository = repository


    @linear_retry()
    def create_produto(self, produto):
        self._validate_produto(produto)
        result = self.repository.insert_produto(produto)
        log.info("Produto created successfully")
        return result


    def read_produto(self):
        return self.repository.select_produto()


    def update_produto(self, produto_id, produto):
        self._validate_produto(produto)
        result = self.repository.update_produto(produto_id, produto)
        if result:
            log.info("Produto updated successfully")
        return result


    def delete_produto(self, produto_id):
        result = self.repository.delete_produto(produto_id)
        if result:
            log.info("Produto deleted successfully")
        return result


    @staticmethod
    def _validate_produto(produto):
        erros = []
        for campo, rotulo in CAMPOS_OBRIGATORIOS.items():
            if not str(produto.get(campo) or "").strip():
                erros.append(f"Informe o campo \"{rotulo}\" do produto.")
        if erros:
            raise ValidacaoError(erros)
