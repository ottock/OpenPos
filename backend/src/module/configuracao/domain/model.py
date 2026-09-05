from pydantic import BaseModel, Field


class ConfiguracaoSave(BaseModel):
    diretorio_salvamento: str = Field(min_length=1)