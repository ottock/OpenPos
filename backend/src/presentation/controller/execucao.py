class ExecucaoController:
    def __init__(self, service):
        self.service = service


    def executar(self, execucao):
        return self.service.executar(execucao)


    def listar(self):
        return self.service.listar()
