import logging
from datetime import date
from xml.etree import ElementTree as ET

from domain.service.errors import ValidacaoExecucaoError

log = logging.getLogger(__name__)

# Tipos de telefone aceitos pelo leiaute (AtdtCsmoPct/Ppl -> TipTelAtdtCsmoPpl).
TIPOS_TELEFONE_VALIDOS = {
    "ACESSO DO EXTERIOR",
    "CAPITAIS E REGIOES METROPOLITANAS",
    "DEFICIENCIA AUDITIVA/FALA",
    "DEMAIS REGIOES",
}


class Acpo109Service:
    """Gerador do layout ACPO109 (EnvoCfg) - plugado no ExecucaoService."""

    def __init__(self, fonte_principal_repository):
        self.repository = fonte_principal_repository

    def remessa_automatica(self, nr_rms, seql_rms, cd_ocr=None):
        """
        Monta o envelope da remessa (EnvoCfg) inteiramente a partir de dados ja
        cadastrados: CnpjIf/CnpjGbd vem da propria Fonte Principal (unico
        participante hoje modelado no sistema) e DtRms e a data corrente.
        NrRms/SeqlRms sao calculados pelo ExecucaoService a partir do
        historico de execucoes.
        """
        fonte = self._carregar_fonte()
        return {
            "cnpj_if": fonte["cnpj"],
            "cnpj_gbd": fonte["cnpj"],
            "nr_rms": nr_rms,
            "seql_rms": seql_rms,
            "dt_rms": date.today().strftime("%d%m%Y"),
            "cd_ocr": cd_ocr,
        }

    def gerar_xml(self, remessa):
        log.debug("Executing ACPO109 generation orchestration")

        fonte = self._carregar_fonte()
        contatos = self._filtrar_por_fonte(self.repository.select_contato_tecnico(), fonte["id"])
        canais = self._filtrar_por_fonte(self.repository.select_atendimento_consumidor(), fonte["id"])
        pessoas = self._filtrar_por_fonte(self.repository.select_pessoa_autorizada(), fonte["id"])

        erros = []
        erros += self._validar_fonte(fonte)
        erros += self._validar_lista(contatos, "Contato técnico", ["nome", "departamento", "ddd", "telefone", "email"])
        erros += self._validar_lista(canais, "Canal de atendimento ao consumidor", ["departamento", "tipo_telefone", "telefone"])
        erros += self._validar_lista(pessoas, "Pessoa autorizada para liminar", ["nome", "cpf", "ddd", "telefone", "email"])
        for idx, canal in enumerate(canais, start=1):
            tipo = canal.get("tipo_telefone")
            if tipo and tipo not in TIPOS_TELEFONE_VALIDOS:
                erros.append(
                    f"Canal de atendimento ao consumidor #{idx}: tipo de telefone \"{tipo}\" "
                    f"não é um valor aceito pelo leiaute ACPO109."
                )
        if erros:
            raise ValidacaoExecucaoError(erros)

        root = self._montar_xml(remessa, fonte, contatos, canais, pessoas)
        xml_bytes = ET.tostring(root, encoding="UTF-8", xml_declaration=True)
        filename = (
            f"ACPO109_{fonte['cnpj']}_{remessa['nr_rms']:09d}_{remessa['seql_rms']:03d}.xml"
        )
        log.info("ACPO109 XML generated successfully (%s)", filename)
        return {"xml": xml_bytes.decode("UTF-8"), "filename": filename}

    def _carregar_fonte(self):
        registros = self.repository.select_fonte_principal()
        if not registros:
            raise ValidacaoExecucaoError(
                ["Cadastre a Identificação da Fonte Principal antes de gerar o arquivo ACPO109."]
            )
        return registros[0]

    @staticmethod
    def _filtrar_por_fonte(itens, fonte_id):
        return [it for it in (itens or []) if it.get("fonte_principal_id") == fonte_id]

    @staticmethod
    def _validar_fonte(fonte):
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
    def _validar_lista(itens, rotulo, campos_obrigatorios):
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

    def _montar_xml(self, remessa, fonte, contatos, canais, pessoas):
        root = ET.Element("EnvoCfg", self._atributos_remessa(remessa))

        ppl = ET.SubElement(root, "Ppl", self._atributos_ppl(fonte))
        ET.SubElement(ppl, "EndPpl", self._atributos_end_ppl(fonte))
        for contato in contatos:
            ET.SubElement(ppl, "CttPpl", self._atributos_ctt_ppl(contato))
        for canal in canais:
            ET.SubElement(ppl, "AtdtCsmoPpl", self._atributos_atdt_csmo_ppl(canal))
        for pessoa in pessoas:
            ET.SubElement(ppl, "AutdLmnrPpl", self._atributos_autd_lmnr_ppl(pessoa))

        return root

    @staticmethod
    def _atributos_remessa(remessa):
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
    def _atributos_ppl(fonte):
        attrs = {"NmPpl": fonte["nome_completo"][:60], "CnpjPpl": fonte["cnpj"]}
        if fonte.get("url_site"):
            attrs["SitePpl"] = fonte["url_site"][:120]
        return attrs

    @staticmethod
    def _atributos_end_ppl(fonte):
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
    def _atributos_ctt_ppl(contato):
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
    def _atributos_atdt_csmo_ppl(canal):
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
    def _atributos_autd_lmnr_ppl(pessoa):
        attrs = {
            "NmAutdLmnrPpl": pessoa["nome"][:60],
            "CpfAutdLmnrPpl": str(pessoa["cpf"]),
            "DddTelAutdLmnrPpl": str(pessoa["ddd"]),
            "NrTelAutdLmnrPpl": str(pessoa["telefone"]),
            "EmaiAutdLmnrPpl": pessoa["email"][:120],
        }
        return attrs
