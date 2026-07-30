from typing import Optional
from pydantic import BaseModel


class ModalidadeCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo_reporte: str


class ModalidadeUpdate(ModalidadeCreate):
    pass
