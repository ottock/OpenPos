from typing import Optional
from pydantic import BaseModel


class ProdutoCreate(BaseModel):
    codigo: str
    nome: str
    ativo: bool = True
    modalidade_id: Optional[int] = None


class ProdutoUpdate(ProdutoCreate):
    pass
