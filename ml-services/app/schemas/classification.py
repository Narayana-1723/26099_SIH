from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ClassifyRequest(BaseModel):
    materialCode: Optional[str] = Field(default=None, description="Optional material code")
    description: str = Field(..., min_length=1, max_length=1000, description="Material description to classify")


class ClassifyResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    materialCode: Optional[str] = Field(default=None, description="Optional material code")
    category: str = Field(..., description="Top-level taxonomy category, e.g. Mechanical, Electrical")
    subcategory: str = Field(..., description="Subcategory, e.g. Fasteners, Valves, Cables")
    item_class: str = Field(..., alias="class", description="Granular material class, e.g. Bolts, Ball Valves")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calibrated classifier confidence probability")
    modelVersion: str = Field(default="classifier-v1", description="Classification model version")


class BatchClassifyRequest(BaseModel):
    materials: List[ClassifyRequest] = Field(..., min_length=1, max_length=500, description="Batch of materials to classify")


class BatchClassifyResponse(BaseModel):
    results: List[ClassifyResponse] = Field(..., description="Classification results for the batch")
