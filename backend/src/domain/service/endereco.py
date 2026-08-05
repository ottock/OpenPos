import logging
from pathlib import Path

from core.pattern.retry import linear_retry


log = logging.getLogger(__name__)
QUERY_ROOT = Path(__file__).resolve().parents[2] / "repository" / "postgres" / "query"
QUERY_DIR = QUERY_ROOT / "endereco"


class ValidacaoError(Exception):
    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))


CAMPOS_OBRIGATORIOS = {
    "cep": "CEP",
    "logradouro": "Logradouro",
    "bairro": "Bairro",
    "municipio": "Município",
    "uf": "UF",
}


class EnderecoService:
    def __init__(self, db_client):
        self.db_client = db_client


    @linear_retry()
    def create_endereco(self, endereco):
        self._validate_endereco(endereco)
        log.debug("Executing endereco create query")
        params = (
            endereco["cep"],
            endereco["logradouro"],
            endereco.get("numero"),
            endereco.get("complemento"),
            endereco["bairro"],
            endereco["municipio"],
            endereco["uf"],
        )
        result = self.db_client.execute_query_path(
            str(QUERY_DIR / "create_endereco.sql"), params
        )
        log.info("Endereco created successfully")
        return result[0] if result else None


    def read_endereco(self):
        log.debug("Executing endereco read query")
        result = self.db_client.execute_query_path(str(QUERY_DIR / "read_endereco.sql"))
        log.info("Endereco list retrieved successfully")
        return result


    @staticmethod
    def _validate_endereco(endereco):
        erros = []
        for campo, rotulo in CAMPOS_OBRIGATORIOS.items():
            if not str(endereco.get(campo) or "").strip():
                erros.append(f"Informe o campo \"{rotulo}\" do endereço.")
        if erros:
            raise ValidacaoError(erros)
