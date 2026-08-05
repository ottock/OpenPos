import logging
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

from pydantic import ValidationError as PydanticValidationError

from domain.model.acpo109 import Acpo109GerarRequest


log = logging.getLogger(__name__)


TIPOS_TELEFONE_VALIDOS = {
    "ACESSO DO EXTERIOR",
    "CAPITAIS E REGIOES METROPOLITANAS",
    "DEFICIENCIA AUDITIVA/FALA",
    "DEMAIS REGIOES",
}


class ValidacaoError(Exception):
    def __init__(self, messages):
        self.messages = list(messages)
        super().__init__("; ".join(self.messages))


class Acpo109Service:
    LAYOUT = "ACPO109"
    def __init__(self, fonte_principal_repository, execucao_repository, configuracao_repository=None):
        self.fonte_principal_repository = fonte_principal_repository
        self.execucao_repository = execucao_repository
        self.configuracao_repository = configuracao_repository


    def generate(self):
        log.debug("Executing ACPO109 generation")

        nr_rms = self._next_nr_rms()
        remessa_dict = self._automatic_remittance(nr_rms=nr_rms, seql_rms=1)
        try:
            remessa = Acpo109GerarRequest(**remessa_dict)
        except PydanticValidationError as exc:
            raise ValidacaoError([self._format_pydantic_error(e) for e in exc.errors()]) from exc

        resultado = self._generate_xml(remessa.model_dump())
        caminho_salvo = self._save_to_disk(resultado)

        registro = self.execucao_repository.insert_execucao(
            {
                "layout": self.LAYOUT,
                "parametros": remessa.model_dump(),
                "nome_arquivo": resultado["filename"],
                "conteudo_arquivo": resultado["xml"],
            }
        )
        log.info("ACPO109 gerado e registrado com sucesso (id=%s)", registro.get("id"))
        registro["caminho_salvo"] = caminho_salvo
        return registro


    def list_all(self):
        return self.execucao_repository.select_execucao()


    def _automatic_remittance(self, nr_rms, seql_rms, cd_ocr=None):
        fonte = self._load_source()
        return {
            "cnpj_if": fonte["cnpj"],
            "cnpj_gbd": fonte["cnpj"],
            "nr_rms": nr_rms,
            "seql_rms": seql_rms,
            "dt_rms": date.today().strftime("%d%m%Y"),
            "cd_ocr": cd_ocr,
        }


    def _generate_xml(self, remessa):
        fonte = self._load_source()
        contatos = self._filter_by_source(self.fonte_principal_repository.select_contato_tecnico(), fonte["id"])
        canais = self._filter_by_source(self.fonte_principal_repository.select_atendimento_consumidor(), fonte["id"])
        pessoas = self._filter_by_source(self.fonte_principal_repository.select_pessoa_autorizada(), fonte["id"])

        erros = []
        erros += self._validate_source(fonte)
        erros += self._validate_list(contatos, "Contato técnico", ["nome", "departamento", "ddd", "telefone", "email"])
        erros += self._validate_list(canais, "Canal de atendimento ao consumidor", ["departamento", "tipo_telefone", "telefone"])
        erros += self._validate_list(pessoas, "Pessoa autorizada para liminar", ["nome", "cpf", "ddd", "telefone", "email"])
        for idx, canal in enumerate(canais, start=1):
            tipo = canal.get("tipo_telefone")
            if tipo and tipo not in TIPOS_TELEFONE_VALIDOS:
                erros.append(
                    f"Canal de atendimento ao consumidor #{idx}: tipo de telefone \"{tipo}\" "
                    f"não é um valor aceito pelo leiaute ACPO109."
                )
        if erros:
            raise ValidacaoError(erros)

        root = self._build_xml(remessa, fonte, contatos, canais, pessoas)
        xml_bytes = ET.tostring(root, encoding="UTF-8", xml_declaration=True)
        filename = (
            f"ACPO109_{fonte['cnpj']}_{remessa['nr_rms']:09d}_{remessa['seql_rms']:03d}.xml"
        )
        log.info("ACPO109 XML generated successfully (%s)", filename)
        return {"xml": xml_bytes.decode("UTF-8"), "filename": filename}


    def _save_to_disk(self, resultado):
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
            raise ValidacaoError(
                [f"Não foi possível salvar o arquivo em \"{diretorio}\": {exc.strerror or exc}."]
            ) from exc
        log.info("Arquivo gerado salvo em disco (%s)", destino)
        return str(destino)


    def _next_nr_rms(self):
        anteriores = [e for e in self.execucao_repository.select_execucao() if e.get("layout") == self.LAYOUT]
        if not anteriores:
            return 1
        maior = max(int((e.get("parametros") or {}).get("nr_rms", 0)) for e in anteriores)
        return maior + 1


    def _load_source(self):
        registros = self.fonte_principal_repository.select_fonte_principal()
        if not registros:
            raise ValidacaoError(
                ["Cadastre a Identificação da Fonte Principal antes de gerar o arquivo ACPO109."]
            )
        return registros[0]


    @staticmethod
    def _filter_by_source(itens, fonte_id):
        return [it for it in (itens or []) if it.get("fonte_principal_id") == fonte_id]


    @staticmethod
    def _validate_source(fonte):
        campos = {
            "cnpj": "CNPJ",
            "nome_completo": "Razão Social",
            "logradouro": "Logradouro",
            "bairro": "Bairro",
            "cep": "CEP",
            "municipio": "Município",
            "uf": "UF",
        }
        erros = []
        for campo, rotulo in campos.items():
            if not fonte.get(campo):
                erros.append(f"Identificação da Fonte Principal: campo \"{rotulo}\" não informado.")
        return erros


    @staticmethod
    def _validate_list(itens, rotulo, campos_obrigatorios):
        erros = []
        if not itens:
            erros.append(
                f"{rotulo}: é necessário cadastrar ao menos 1 registro (mínimo exigido pelo leiaute ACPO109)."
            )
        for idx, item in enumerate(itens, start=1):
            for campo in campos_obrigatorios:
                if not item.get(campo):
                    erros.append(f"{rotulo} #{idx}: campo \"{campo}\" não informado.")
        return erros


    def _build_xml(self, remessa, fonte, contatos, canais, pessoas):
        root = ET.Element("EnvoCfg", self._remittance_attributes(remessa))

        ppl = ET.SubElement(root, "Ppl", self._participant_attributes(fonte))
        ET.SubElement(ppl, "EndPpl", self._participant_address_attributes(fonte))
        for contato in contatos:
            ET.SubElement(ppl, "CttPpl", self._participant_contact_attributes(contato))
        for canal in canais:
            ET.SubElement(ppl, "AtdtCsmoPpl", self._consumer_service_attributes(canal))
        for pessoa in pessoas:
            ET.SubElement(ppl, "AutdLmnrPpl", self._authorized_person_attributes(pessoa))

        return root


    @staticmethod
    def _remittance_attributes(remessa):
        attrs = {
            "CnpjIf": remessa["cnpj_if"],
            "CnpjGbd": remessa["cnpj_gbd"],
            "NrRms": str(remessa["nr_rms"]),
            "SeqlRms": str(remessa["seql_rms"]),
            "DtRms": remessa["dt_rms"],
        }
        if remessa.get("cd_ocr") is not None:
            attrs["CdOcr"] = str(remessa["cd_ocr"])
        return attrs


    @staticmethod
    def _participant_attributes(fonte):
        attrs = {"NmPpl": fonte["nome_completo"][:60], "CnpjPpl": fonte["cnpj"]}
        if fonte.get("url_site"):
            attrs["SitePpl"] = fonte["url_site"][:120]
        return attrs


    @staticmethod
    def _participant_address_attributes(fonte):
        logradouro = fonte["logradouro"]
        if fonte.get("numero"):
            logradouro = f"{logradouro}, {fonte['numero']}"
        attrs = {
            "LgrEndPpl": logradouro[:60],
            "BaiEndPpl": fonte["bairro"][:60],
            "CepEndPpl": str(fonte["cep"]).zfill(8),
            "MunEndPpl": fonte["municipio"][:60],
            "UfEndPpl": fonte["uf"],
        }
        if fonte.get("complemento"):
            attrs["CmptEndPpl"] = fonte["complemento"][:60]
        return attrs


    @staticmethod
    def _participant_contact_attributes(contato):
        attrs = {
            "NmCttPpl": contato["nome"][:60],
            "DptCttPpl": contato["departamento"][:60],
            "DddTelCttPpl": str(contato["ddd"]),
            "NrTelCttPpl": str(contato["telefone"]),
            "EmaiCttPpl": contato["email"][:120],
        }
        if contato.get("cargo"):
            attrs["CrgCttPpl"] = contato["cargo"][:60]
        if contato.get("ramal"):
            attrs["RmalTelCttPpl"] = str(contato["ramal"])[:4]
        return attrs


    @staticmethod
    def _consumer_service_attributes(canal):
        attrs = {
            "DptAtdtCsmoPpl": canal["departamento"][:60],
            "TipTelAtdtCsmoPpl": canal["tipo_telefone"],
            "NrTelAtdtCsmoPpl": str(canal["telefone"]),
        }
        if canal.get("cod_pais"):
            attrs["CdPaisTelAtdtCsmoPpl"] = str(canal["cod_pais"])
        if canal.get("ddd"):
            attrs["DddTelAtdtCsmoPpl"] = str(canal["ddd"])
        if canal.get("email"):
            attrs["EmaiAtdtCsmoPpl"] = canal["email"][:120]
        return attrs


    @staticmethod
    def _authorized_person_attributes(pessoa):
        attrs = {
            "NmAutdLmnrPpl": pessoa["nome"][:60],
            "CpfAutdLmnrPpl": str(pessoa["cpf"]),
            "DddTelAutdLmnrPpl": str(pessoa["ddd"]),
            "NrTelAutdLmnrPpl": str(pessoa["telefone"]),
            "EmaiAutdLmnrPpl": pessoa["email"][:120],
        }
        return attrs


    @staticmethod
    def _format_pydantic_error(erro):
        campo = '.'.join(str(parte) for parte in erro["loc"])
        return f"{campo}: {erro['msg']}"
