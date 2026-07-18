from typing import Optional

from pydantic import BaseModel


class FontePrincipalCreate(BaseModel):
    cnpj: str
    nome_completo: str
    tipo: str = "OUTRO"
    ispb_fonte: str
    ispb_cip: str
    endereco_id: int
    telefone_id: Optional[int] = None
    url_site: Optional[str] = None


class IdentificacaoCreate(BaseModel):
    # Fonte
    cnpj: str
    nome_completo: str
    tipo: str = "OUTRO"
    ispb_fonte: str
    ispb_cip: str
    url_site: Optional[str] = None
    # Endereco
    cep: str
    logradouro: str
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: str
    municipio: str
    uf: str


class ContatoTecnicoCreate(BaseModel):
    fonte_principal_id: int
    nome: str
    email: Optional[str] = None
    departamento: Optional[str] = None
    cargo: Optional[str] = None
    ddd: Optional[str] = None
    telefone: Optional[str] = None
    ramal: Optional[str] = None


class AtendimentoConsumidorCreate(BaseModel):
    fonte_principal_id: int
    departamento: Optional[str] = None
    email: Optional[str] = None
    tipo_telefone: Optional[str] = None
    cod_pais: Optional[str] = None
    ddd: Optional[str] = None
    telefone: Optional[str] = None


class PessoaAutorizadaCreate(BaseModel):
    fonte_principal_id: int
    nome: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    ddd: Optional[str] = None
    telefone: Optional[str] = None
