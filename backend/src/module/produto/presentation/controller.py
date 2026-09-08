class ProdutoController:
    def __init__(self, service):
        self.service = service


    def create_produto(self, produto):
        return self.service.create_produto(produto)


    def read_produto(self):
        return self.service.read_produto()


    def update_produto(self, produto_id, produto):
        return self.service.update_produto(produto_id, produto)


    def delete_produto(self, produto_id):
        return self.service.delete_produto(produto_id)
