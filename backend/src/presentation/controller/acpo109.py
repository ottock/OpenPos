class Acpo109Controller:
    def __init__(self, service):
        self.service = service


    def generate(self):
        return self.service.generate()


    def list_all(self):
        return self.service.list_all()


    def reset_history(self):
        return self.service.reset_history()
