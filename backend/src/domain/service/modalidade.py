import logging

from core.pattern.retry import linear_retry


log = logging.getLogger(__name__)


class ValidacaoError(Exception):


    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))


CAMPOS_OBRIGATORIOS = {
    "nome": "Nome",
    "tipo_reporte": "Tipo de Reporte",
}


class ModalidadeService:


    def __init__(self, repository):
        self.repository = repository


    @linear_retry()
    def create_modalidade(self, modalidade):
        self._validate_modalidade(modalidade)
        result = self.repository.insert_modalidade(modalidade)
        log.info("Modalidade created successfully")
        return result


    def read_modalidade(self):
        return self.repository.select_modalidade()


    def update_modalidade(self, modalidade_id, modalidade):
        self._validate_modalidade(modalidade)
        result = self.repository.update_modalidade(modalidade_id, modalidade)
        if result:
            log.info("Modalidade updated successfully")
        return result


    def delete_modalidade(self, modalidade_id):
        result = self.repository.delete_modalidade(modalidade_id)
        if result:
            log.info("Modalidade deleted successfully")
        return result


    @staticmethod
    def _validate_modalidade(modalidade):
        erros = []
        for campo, rotulo in CAMPOS_OBRIGATORIOS.items():
            if not str(modalidade.get(campo) or "").strip():
                erros.append(f"Informe o campo \"{rotulo}\" da modalidade.")
        if erros:
            raise ValidacaoError(erros)
