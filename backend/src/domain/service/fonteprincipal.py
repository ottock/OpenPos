import logging


log = logging.getLogger(__name__)


class FontePrincipalService:
    def __init__(self, repository, endereco_service=None):
        self.repository = repository
        self.endereco_service = endereco_service


    def create_identificacao(self, identificacao):
        log.debug("Executing identificacao orchestration")
        if self.endereco_service is None:
            raise RuntimeError("EnderecoService is required to create identificacao.")

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


    def create_fonte_principal(self, fonte_principal):
        result = self.repository.insert_fonte_principal(fonte_principal)
        log.info("Fonte principal created successfully")
        return result


    def read_fonte_principal(self):
        return self.repository.select_fonte_principal()


    def create_contato_tecnico(self, contato_tecnico):
        result = self.repository.insert_contato_tecnico(contato_tecnico)
        log.info("Contato tecnico created successfully")
        return result


    def read_contato_tecnico(self):
        return self.repository.select_contato_tecnico()


    def create_atendimento_consumidor(self, atendimento_consumidor):
        result = self.repository.insert_atendimento_consumidor(atendimento_consumidor)
        log.info("Atendimento consumidor created successfully")
        return result


    def read_atendimento_consumidor(self):
        return self.repository.select_atendimento_consumidor()


    def create_pessoa_autorizada(self, pessoa_autorizada):
        result = self.repository.insert_pessoa_autorizada(pessoa_autorizada)
        log.info("Pessoa autorizada created successfully")
        return result


    def read_pessoa_autorizada(self):
        return self.repository.select_pessoa_autorizada()