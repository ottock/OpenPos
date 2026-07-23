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


    def read_contato_tecnico(self):
        return self.service.read_contato_tecnico()


    def create_atendimento_consumidor(self, atendimento_consumidor):
        return self.service.create_atendimento_consumidor(atendimento_consumidor)


    def read_atendimento_consumidor(self):
        return self.service.read_atendimento_consumidor()


    def create_pessoa_autorizada(self, pessoa_autorizada):
        return self.service.create_pessoa_autorizada(pessoa_autorizada)


    def read_pessoa_autorizada(self):
        return self.service.read_pessoa_autorizada()