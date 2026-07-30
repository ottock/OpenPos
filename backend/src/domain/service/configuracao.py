import logging
from pathlib import Path

from domain.service.errors import ValidacaoError


log = logging.getLogger(__name__)


class ConfiguracaoService:
    def __init__(self, repository):
        self.repository = repository


    def read_configuracao(self):
        return self.repository.select_configuracao()


    def save_configuracao(self, configuracao):
        diretorio = (configuracao.get("diretorio_salvamento") or "").strip()
        if not diretorio:
            raise ValidacaoError(["Informe o diretório onde os arquivos ACPO serão salvos."])
        if not Path(diretorio).is_absolute():
            raise ValidacaoError([f'Informe um caminho absoluto (ex.: "C:\\ACPO"). Recebido: "{diretorio}".'])

        try:
            Path(diretorio).mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise ValidacaoError([f'Não foi possível usar o diretório "{diretorio}": {exc.strerror or exc}.']) from exc

        dados = {"diretorio_salvamento": diretorio}
        existente = self.repository.select_configuracao()
        if existente:
            resultado = self.repository.update_configuracao(existente["id"], dados)
        else:
            resultado = self.repository.insert_configuracao(dados)
        log.info("Configuracao salva com sucesso (diretorio_salvamento=%s)", diretorio)
        return resultado
