class FontePrincipalController:
    def __init__(self, service):
        self.service = service


    def create_fonte_principal(self, fonte_principal):
        return self.service.create_fonte_principal(fonte_principal)


    def read_fonte_principal(self):
        return self.service.read_fonte_principal()