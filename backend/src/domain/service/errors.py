class ValidacaoExecucaoError(Exception):
    """Dados cadastrais incompletos/invalidos para executar a geracao de um layout."""

    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))
