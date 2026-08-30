class FontePrincipalController:
    def __init__(self, service):
        self.service = service


    def create_identificacao(self, identificacao):
        return self.service.create_identificacao(identificacao)


    def create_fonte_principal(self, fonte_principal):
        return self.service.create_fonte_principal(fonte_principal)


    def read_fonte_principal(self):
        return self.service.read_fonte_principal()


    def create_contato_tecnico(self, contato_tecnico):
        return self.service.create_contato_tecnico(contato_tecnico)


    def update_contato_tecnico(self, contato_tecnico_id, contato_tecnico):
        return self.service.update_contato_tecnico(contato_tecnico_id, contato_tecnico)


    def read_contato_tecnico(self):
        return self.service.read_contato_tecnico()


    def create_atendimento_consumidor(self, atendimento_consumidor):
        return self.service.create_atendimento_consumidor(atendimento_consumidor)


    def update_atendimento_consumidor(self, atendimento_consumidor_id, atendimento_consumidor):
        return self.service.update_atendimento_consumidor(atendimento_consumidor_id, atendimento_consumidor)


    def read_atendimento_consumidor(self):
        return self.service.read_atendimento_consumidor()


    def create_pessoa_autorizada(self, pessoa_autorizada):
        return self.service.create_pessoa_autorizada(pessoa_autorizada)


    def update_pessoa_autorizada(self, pessoa_autorizada_id, pessoa_autorizada):
        return self.service.update_pessoa_autorizada(pessoa_autorizada_id, pessoa_autorizada)


    def read_pessoa_autorizada(self):
        return self.service.read_pessoa_autorizada()
