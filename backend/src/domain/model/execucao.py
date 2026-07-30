from typing import Any, Dict
from pydantic import BaseModel, Field


class ExecucaoCreate(BaseModel):
    layout: str
    parametros: Dict[str, Any] = Field(default_factory=dict)
