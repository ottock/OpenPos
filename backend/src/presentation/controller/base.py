from domain.service.endereco import EnderecoService
from domain.service.fonteprincipal import FontePrincipalService
from repository.fonteprincipal import FontePrincipalRepository
from presentation.controller.endereco import EnderecoController
from presentation.controller.fonteprincipal import FontePrincipalController
from repository.produto import ProdutoRepository
from domain.service.produto import ProdutoService
from presentation.controller.produto import ProdutoController
from repository.modalidade import ModalidadeRepository
from domain.service.modalidade import ModalidadeService
from presentation.controller.modalidade import ModalidadeController
from repository.execucao import ExecucaoRepository
from domain.service.execucao import ExecucaoService
from presentation.controller.execucao import ExecucaoController


def get_fonte_principal_controller(db_client):
    repository = FontePrincipalRepository(db_client)
    endereco_service = EnderecoService(db_client)
    service = FontePrincipalService(repository, endereco_service)
    return FontePrincipalController(service)


def get_endereco_controller(db_client):
    service = EnderecoService(db_client)
    return EnderecoController(service)


def get_produto_controller(db_client):
    repository = ProdutoRepository(db_client)
    service = ProdutoService(repository)
    return ProdutoController(service)


def get_modalidade_controller(db_client):
    repository = ModalidadeRepository(db_client)
    service = ModalidadeService(repository)
    return ModalidadeController(service)


def get_execucao_controller(db_client):
    repository = ExecucaoRepository(db_client)
    fonte_principal_repository = FontePrincipalRepository(db_client)
    service = ExecucaoService(repository, fonte_principal_repository)
    return ExecucaoController(service)