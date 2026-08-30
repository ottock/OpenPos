import logging

from core.pattern.retry import linear_retry


log = logging.getLogger(__name__)


class ValidacaoError(Exception):
    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))


CAMPOS_OBRIGATORIOS_FONTE = {
    "cnpj": "CNPJ",
    "nome_completo": "Razão Social",
    "ispb_fonte": "ISPB da Fonte",
    "ispb_cip": "ISPB da CIP",
}
CAMPOS_OBRIGATORIOS_CONTATO = {
    "nome": "Nome",
}


class FontePrincipalService:
    def __init__(self, repository, endereco_service=None):
        self.repository = repository
        self.endereco_service = endereco_service


    def create_identificacao(self, identificacao):
        log.debug("Executing identificacao orchestration")
        if self.endereco_service is None:
            raise RuntimeError("EnderecoService is required to create identificacao.")

        self._validate_fields(identificacao, CAMPOS_OBRIGATORIOS_FONTE, "Identificação da Fonte Principal")
        endereco = self.endereco_service.create_endereco(identificacao)
        if not endereco or endereco.get("id") is None:
            raise RuntimeError("Failed to create endereco for identificacao.")

        fonte = self.create_fonte_principal(
            {**identificacao, "endereco_id": endereco["id"]}
        )
        if fonte and fonte.get("id") is not None:
            completa = self.repository.select_fonte_principal_by_id(fonte["id"])
            if completa:
                log.info("Identificacao saved successfully")
                return completa
        return fonte


    @linear_retry()
    def create_fonte_principal(self, fonte_principal):
        self._validate_fields(fonte_principal, CAMPOS_OBRIGATORIOS_FONTE, "Fonte Principal")
        result = self.repository.insert_fonte_principal(fonte_principal)
        log.info("Fonte principal created successfully")
        return result


    def read_fonte_principal(self):
        return self.repository.select_fonte_principal()


    @linear_retry()
    def create_contato_tecnico(self, contato_tecnico):
        self._validate_fields(contato_tecnico, CAMPOS_OBRIGATORIOS_CONTATO, "Contato Técnico")
        result = self.repository.insert_contato_tecnico(contato_tecnico)
        log.info("Contato tecnico created successfully")
        return result


    def update_contato_tecnico(self, contato_tecnico_id, contato_tecnico):
        self._validate_fields(contato_tecnico, CAMPOS_OBRIGATORIOS_CONTATO, "Contato Técnico")
        result = self.repository.update_contato_tecnico(contato_tecnico_id, contato_tecnico)
        if result:
            log.info("Contato tecnico updated successfully")
        return result


    def read_contato_tecnico(self):
        return self.repository.select_contato_tecnico()


    @linear_retry()
    def create_atendimento_consumidor(self, atendimento_consumidor):
        result = self.repository.insert_atendimento_consumidor(atendimento_consumidor)
        log.info("Atendimento consumidor created successfully")
        return result


    def update_atendimento_consumidor(self, atendimento_consumidor_id, atendimento_consumidor):
        result = self.repository.update_atendimento_consumidor(atendimento_consumidor_id, atendimento_consumidor)
        if result:
            log.info("Atendimento consumidor updated successfully")
        return result


    def read_atendimento_consumidor(self):
        return self.repository.select_atendimento_consumidor()


    @linear_retry()
    def create_pessoa_autorizada(self, pessoa_autorizada):
        result = self.repository.insert_pessoa_autorizada(pessoa_autorizada)
        log.info("Pessoa autorizada created successfully")
        return result


    def update_pessoa_autorizada(self, pessoa_autorizada_id, pessoa_autorizada):
        result = self.repository.update_pessoa_autorizada(pessoa_autorizada_id, pessoa_autorizada)
        if result:
            log.info("Pessoa autorizada updated successfully")
        return result


    def read_pessoa_autorizada(self):
        return self.repository.select_pessoa_autorizada()


    @staticmethod
    def _validate_fields(dados, campos_obrigatorios, contexto):
        erros = []
        for campo, rotulo in campos_obrigatorios.items():
            if not str(dados.get(campo) or "").strip():
                erros.append(f"{contexto}: informe o campo \"{rotulo}\".")
        if erros:
            raise ValidacaoError(erros)
