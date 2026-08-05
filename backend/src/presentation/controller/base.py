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
from repository.acpo109 import Acpo109Repository
from domain.service.acpo109 import Acpo109Service
from presentation.controller.acpo109 import Acpo109Controller
from repository.configuracao import ConfiguracaoRepository
from domain.service.configuracao import ConfiguracaoService
from presentation.controller.configuracao import ConfiguracaoController


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


def get_acpo109_controller(db_client):
    repository = Acpo109Repository(db_client)
    fonte_principal_repository = FontePrincipalRepository(db_client)
    configuracao_repository = ConfiguracaoRepository(db_client)
    service = Acpo109Service(fonte_principal_repository, repository, configuracao_repository)
    return Acpo109Controller(service)


def get_configuracao_controller(db_client):
    repository = ConfiguracaoRepository(db_client)
    service = ConfiguracaoService(repository)
    return ConfiguracaoController(service)