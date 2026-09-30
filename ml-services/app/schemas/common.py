from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class HealthResponse(BaseModel):
    status: str = Field(default="UP", description="Overall health status of the service")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp")
    version: str = Field(default="1.0.0", description="API Version")


class ModelStatusResponse(BaseModel):
    status: str = Field(default="UP", description="Overall model availability status")
    models: Dict[str, str] = Field(
        default_factory=lambda: {
            "embedding": "LOADED",
            "ner": "LOADED",
            "classification": "LOADED",
        },
        description="Loaded status of each individual model"
    )
    device: str = Field(default="cpu", description="Execution hardware target (cpu / cuda)")


class ErrorResponse(BaseModel):
    success: bool = Field(default=False)
    errorCode: str
    message: str
    details: Optional[Dict[str, Any]] = None
