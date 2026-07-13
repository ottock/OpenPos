class FontePrincipalController:
    def __init__(self, service):
        self.service = service

    def read_fonte_principal(self):
        return self.service.list_fonte_principal()