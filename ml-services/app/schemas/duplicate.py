from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.matching import MaterialItem


class DuplicateGroup(BaseModel):
    groupId: str = Field(..., description="Unique duplicate cluster identifier, e.g. DUP-001")
    materials: List[str] = Field(..., description="List of duplicate material codes")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Average matching confidence within the duplicate cluster")
    representativeDescription: Optional[str] = Field(default=None, description="Standardized canonical description")
    commonAttributes: Dict[str, Any] = Field(default_factory=dict, description="Shared engineering attributes")


class DuplicateDetectionRequest(BaseModel):
    materials: List[MaterialItem] = Field(..., min_length=2, max_length=500, description="List of materials to scan for duplicates")
    similarityThreshold: Optional[float] = Field(default=None, ge=0.5, le=1.0, description="Custom confidence threshold for clustering")


class DuplicateDetectionResponse(BaseModel):
    duplicateGroups: List[DuplicateGroup] = Field(..., description="Identified duplicate clusters")
    unmatchedMaterials: List[str] = Field(default_factory=list, description="Material codes without any duplicates detected")
    totalGroups: int = Field(..., description="Total number of duplicate clusters")
    totalDuplicates: int = Field(..., description="Total number of duplicate items found across all clusters")
