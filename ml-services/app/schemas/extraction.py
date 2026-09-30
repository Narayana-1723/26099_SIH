from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ExtractedAttributes(BaseModel):
    itemType: Optional[str] = Field(default=None, description="Primary item type, e.g. Hex Bolt, Pipe, Valve")
    material: Optional[str] = Field(default=None, description="Base material, e.g. Stainless Steel, Carbon Steel")
    grade: Optional[str] = Field(default=None, description="Material grade, e.g. 316, 304, A105")
    diameter: Optional[str] = Field(default=None, description="Diameter or thread, e.g. M16, DN50, 1/2 inch")
    length: Optional[str] = Field(default=None, description="Length dimension, e.g. 50 mm, 100 mm, 6 m")
    width: Optional[str] = Field(default=None, description="Width dimension, e.g. 25 mm")
    height: Optional[str] = Field(default=None, description="Height dimension, e.g. 10 mm")
    thickness: Optional[str] = Field(default=None, description="Thickness or schedule, e.g. SCH 40, 5 mm")
    pressureClass: Optional[str] = Field(default=None, description="Pressure rating, e.g. Class 150, PN16, 10 bar")
    voltage: Optional[str] = Field(default=None, description="Voltage rating, e.g. 415 V, 11 kV")
    current: Optional[str] = Field(default=None, description="Current rating, e.g. 100 A")
    power: Optional[str] = Field(default=None, description="Power rating, e.g. 15 kW, 5 HP")
    unit: Optional[str] = Field(default=None, description="Unit of measurement, e.g. NOS, MTR, KG")
    manufacturer: Optional[str] = Field(default=None, description="Manufacturer / brand name")
    model: Optional[str] = Field(default=None, description="Model number or catalog code")
    standard: Optional[str] = Field(default=None, description="Governing engineering standard, e.g. ASTM A193, IS 1239")
    specification: Optional[str] = Field(default=None, description="Additional technical specification")
    additionalAttributes: Dict[str, Any] = Field(default_factory=dict, description="Any additional unstructured parsed attributes")


class EntitySpan(BaseModel):
    text: str
    label: str
    start: int
    end: int


class ExtractAttributesRequest(BaseModel):
    materialCode: Optional[str] = Field(default=None, description="CPSE Material Code identifier")
    description: str = Field(..., min_length=1, max_length=1000, description="Material description text")


class ExtractAttributesResponse(BaseModel):
    materialCode: Optional[str] = Field(default=None, description="CPSE Material Code identifier")
    originalDescription: Optional[str] = Field(default=None, description="Original unedited description")
    normalizedDescription: str = Field(..., description="Normalized description")
    attributes: ExtractedAttributes = Field(..., description="Extracted engineering attributes")
    entities: List[EntitySpan] = Field(default_factory=list, description="NER entity spans detected")


class BatchExtractAttributesRequest(BaseModel):
    materials: List[ExtractAttributesRequest] = Field(..., min_length=1, max_length=500, description="Batch of materials")


class BatchExtractAttributesResponse(BaseModel):
    results: List[ExtractAttributesResponse] = Field(..., description="Batch extraction results")
