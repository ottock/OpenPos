from typing import Optional

from pydantic import BaseModel


class EnderecoCreate(BaseModel):
    cep: str
    logradouro: str
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: str
    municipio: str
    uf: str
