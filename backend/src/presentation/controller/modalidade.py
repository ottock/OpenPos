class ModalidadeController:


    def __init__(self, service):
        self.service = service


    def create_modalidade(self, modalidade):
        return self.service.create_modalidade(modalidade)


    def read_modalidade(self):
        return self.service.read_modalidade()


    def update_modalidade(self, modalidade_id, modalidade):
        return self.service.update_modalidade(modalidade_id, modalidade)


    def delete_modalidade(self, modalidade_id):
        return self.service.delete_modalidade(modalidade_id)
