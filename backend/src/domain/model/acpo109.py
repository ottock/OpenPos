from typing import Optional
from pydantic import BaseModel, Field


class Acpo109GerarRequest(BaseModel):
    cnpj_if: str = Field(..., pattern=r"^[0-9A-Z]{1,12}[0-9]{2}$")
    cnpj_gbd: str = Field(..., pattern=r"^[0-9A-Z]{1,12}[0-9]{2}$")
    nr_rms: int = Field(..., ge=1, le=999999999)
    seql_rms: int = Field(..., ge=1, le=999)
    dt_rms: str = Field(..., pattern=r"^[0-3][0-9][0-1][0-9][1-2][0-9]{3}$")
    cd_ocr: Optional[int] = Field(default=None, ge=0, le=99999)
