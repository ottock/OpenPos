class ConfiguracaoController:
    def __init__(self, service):
        self.service = service


    def read_configuracao(self):
        return self.service.read_configuracao()


    def save_configuracao(self, configuracao):
        return self.service.save_configuracao(configuracao)
