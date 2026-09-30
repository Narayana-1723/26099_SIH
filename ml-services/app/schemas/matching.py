from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from enum import Enum


class MatchType(str, Enum):
    EXACT = "EXACT"
    POTENTIAL_EQUIVALENT = "POTENTIAL_EQUIVALENT"
    SIMILAR = "SIMILAR"
    NOT_MATCH = "NOT_MATCH"


class MaterialItem(BaseModel):
    materialCode: str = Field(..., description="Unique material code")
    description: str = Field(..., min_length=1, max_length=1000, description="Material description")


class MatchExplanation(BaseModel):
    matchedAttributes: List[str] = Field(default_factory=list, description="Attributes that matched between source and candidate")
    differences: List[str] = Field(default_factory=list, description="Observed attribute or dimensional differences")
    positiveFactors: List[str] = Field(default_factory=list, description="Specific factors supporting equivalence")
    negativeFactors: List[str] = Field(default_factory=list, description="Specific factors contradicting equivalence")
    criticalMismatches: List[str] = Field(default_factory=list, description="Critical attribute mismatches that triggered penalties")
    scoreBreakdown: Dict[str, float] = Field(default_factory=dict, description="Algorithmic score components and weights")


class MatchResult(BaseModel):
    materialCode: str = Field(..., description="Candidate material code")
    matchType: MatchType = Field(..., description="Match classification verdict")
    semanticScore: float = Field(..., ge=0.0, le=1.0, description="Cosine similarity of semantic embeddings")
    lexicalScore: float = Field(..., ge=0.0, le=1.0, description="Lexical similarity score (n-grams & token overlap)")
    attributeScore: float = Field(..., ge=0.0, le=1.0, description="Unit-aware engineering attribute similarity")
    finalConfidence: float = Field(..., ge=0.0, le=1.0, description="Calculated confidence after domain rules and penalties")
    explanation: MatchExplanation = Field(..., description="Explainable breakdown of the match decision")
    modelVersion: str = Field(default="embedding-v1", description="Model version used for embeddings")
    pipelineVersion: str = Field(default="harmonization-v1", description="Harmonization pipeline version")


class MatchRequest(BaseModel):
    sourceMaterial: MaterialItem = Field(..., description="The query/source material to match")
    candidateMaterials: List[MaterialItem] = Field(..., min_length=1, max_length=200, description="Candidate materials to evaluate against")


class MatchResponse(BaseModel):
    sourceMaterialCode: Optional[str] = Field(default=None, description="Source material identifier")
    matches: List[MatchResult] = Field(..., description="Ranked match results")


class BatchMatchRequest(BaseModel):
    requests: List[MatchRequest] = Field(..., min_length=1, max_length=50, description="Batch of match requests")


class BatchMatchResponse(BaseModel):
    results: List[MatchResponse] = Field(..., description="Batch matching results")
