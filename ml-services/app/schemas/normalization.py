from typing import Optional, List
from pydantic import BaseModel, Field


class NormalizeRequest(BaseModel):
    materialCode: Optional[str] = Field(default=None, description="CPSE Material Code identifier")
    description: str = Field(..., min_length=1, max_length=1000, description="Raw engineering material description")


class NormalizeResponse(BaseModel):
    materialCode: Optional[str] = Field(default=None, description="CPSE Material Code identifier")
    originalDescription: str = Field(..., description="Original unedited material description")
    normalizedDescription: str = Field(..., description="Normalized standardized material description")
    tokens: List[str] = Field(default_factory=list, description="Clean tokens from normalized description")


class BatchNormalizeRequest(BaseModel):
    materials: List[NormalizeRequest] = Field(..., min_length=1, max_length=500, description="Batch of materials to normalize")


class BatchNormalizeResponse(BaseModel):
    results: List[NormalizeResponse] = Field(..., description="List of normalization results")
