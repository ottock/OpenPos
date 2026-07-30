import logging
from pathlib import Path

from pydantic import ValidationError as PydanticValidationError

from domain.model.acpo109 import Acpo109GerarRequest
from domain.service.acpo109 import Acpo109Service
from domain.service.errors import ValidacaoExecucaoError

log = logging.getLogger(__name__)


class ExecucaoService:
    """
    Janela de execucoes: ponto unico para "executar" a geracao de qualquer
    layout suportado (hoje, apenas ACPO109) a partir dos dados ja cadastrados.
    Novos layouts se plugam registrando um metodo em `self._geradores`.
    """

    def __init__(self, repository, fonte_principal_repository, configuracao_repository=None):
        self.repository = repository
        self.configuracao_repository = configuracao_repository
        self._acpo109 = Acpo109Service(fonte_principal_repository)
        self._geradores = {
            "ACPO109": self._executar_acpo109,
        }

    def layouts_suportados(self):
        return sorted(self._geradores.keys())

    def executar(self, execucao):
        layout = execucao.get("layout")
        gerador = self._geradores.get(layout)
        if gerador is None:
            raise ValidacaoExecucaoError(
                [
                    f"Layout \"{layout}\" não é suportado. "
                    f"Layouts disponíveis: {', '.join(self.layouts_suportados())}."
                ]
            )

        parametros = execucao.get("parametros") or {}
        resultado = gerador(parametros)
        caminho_salvo = self._salvar_em_disco(resultado)

        registro = self.repository.insert_execucao(
            {
                "layout": layout,
                # Persiste os parametros efetivamente usados na geracao (com
                # os valores auto-derivados, ex.: NrRms), nao os recebidos na
                # requisicao - e o que alimenta _proxima_nr_rms na proxima execucao.
                "parametros": resultado.get("parametros", parametros),
                "nome_arquivo": resultado["filename"],
                "conteudo_arquivo": resultado["xml"],
            }
        )
        log.info("Execucao registrada com sucesso (layout=%s, id=%s)", layout, registro.get("id"))
        registro["caminho_salvo"] = caminho_salvo
        return registro

    def listar(self):
        return self.repository.select_execucao()

    def _salvar_em_disco(self, resultado):
        """Grava uma copia do arquivo gerado no diretorio configurado em Configuracoes,
        se houver um configurado. Retorna o caminho gravado, ou None se nao configurado."""
        if self.configuracao_repository is None:
            return None
        configuracao = self.configuracao_repository.select_configuracao()
        diretorio = (configuracao or {}).get("diretorio_salvamento")
        if not diretorio:
            return None

        destino = Path(diretorio) / resultado["filename"]
        try:
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(resultado["xml"], encoding="utf-8")
        except OSError as exc:
            raise ValidacaoExecucaoError(
                [f'Não foi possível salvar o arquivo em "{diretorio}": {exc.strerror or exc}.']
            ) from exc
        log.info("Arquivo gerado salvo em disco (%s)", destino)
        return str(destino)

    def _executar_acpo109(self, parametros):
        # Nenhum dado e digitado pelo usuario: CnpjIf/CnpjGbd/DtRms vem da
        # Fonte Principal e da data corrente (Acpo109Service.remessa_automatica);
        # NrRms/SeqlRms vem do proprio historico de execucoes desta janela.
        nr_rms = self._proxima_nr_rms("ACPO109")
        remessa_dict = self._acpo109.remessa_automatica(nr_rms=nr_rms, seql_rms=1)
        try:
            remessa = Acpo109GerarRequest(**remessa_dict)
        except PydanticValidationError as exc:
            raise ValidacaoExecucaoError([self._formatar_erro_pydantic(e) for e in exc.errors()]) from exc
        resultado = self._acpo109.gerar_xml(remessa.model_dump())
        resultado["parametros"] = remessa.model_dump()
        return resultado

    def _proxima_nr_rms(self, layout):
        anteriores = [e for e in self.repository.select_execucao() if e.get("layout") == layout]
        if not anteriores:
            return 1
        maior = max(int((e.get("parametros") or {}).get("nr_rms", 0)) for e in anteriores)
        return maior + 1

    @staticmethod
    def _formatar_erro_pydantic(erro):
        campo = ".".join(str(parte) for parte in erro["loc"])
        return f"{campo}: {erro['msg']}"
