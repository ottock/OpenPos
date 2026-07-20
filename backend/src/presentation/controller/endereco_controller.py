class EnderecoController:
    def __init__(self, service):
        self.service = service


    def create_endereco(self, endereco):
        return self.service.create_endereco(endereco)


    def read_endereco(self):
        return self.service.read_endereco()