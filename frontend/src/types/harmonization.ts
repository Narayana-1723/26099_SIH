import { Material } from './material';
import { CanonicalMaterial } from './canonical';

export interface ScoreBreakdown {
  semanticScore: number; // 0 - 100
  attributeScore: number; // 0 - 100
  lexicalScore: number;   // 0 - 100
  finalConfidence: number;// 0 - 100
}

export interface MatchExplanation {
  matchedAttributes: Array<{
    key: string;
    sourceValue: string;
    targetValue: string;
  }>;
  unmatchedAttributes: Array<{
    key: string;
    sourceValue?: string;
    targetValue?: string;
  }>;
  appliedRules: string[];
  notes?: string;
}

export interface HarmonizationMatchCandidate {
  canonicalMaterial: CanonicalMaterial;
  scores: ScoreBreakdown;
  explanation: MatchExplanation;
  recommendationLevel: 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'LOW_CONFIDENCE';
}

export interface HarmonizationResult {
  material: Material;
  candidates: HarmonizationMatchCandidate[];
  topMatch?: HarmonizationMatchCandidate;
}

/** Backend response for POST /api/harmonization/match. Scores are 0..1. */
export interface BackendHarmonizationMatch {
  id: number;
  materialId: number;
  materialCode?: string;
  materialDescription?: string;
  cpseCode?: string;
  canonicalMaterialId?: number;
  canonicalCode?: string;
  canonicalStandardName?: string;
  semanticScore: number;
  lexicalScore: number;
  attributeScore: number;
  finalConfidence: number;
  matchType: string;
  status: string;
  explanation?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Material fields returned by the backend material catalog endpoint. */
export interface BackendMaterialRecord {
  id: number;
  cpseCode?: string;
  originalMaterialCode?: string;
  originalDescription?: string;
  normalizedDescription?: string;
  status?: string;
  attributes?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMaterialPage {
  data: BackendMaterialRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DuplicateGroup {
  id: string;
  canonicalCandidateCode?: string;
  canonicalCandidateName?: string;
  confidence: number;
  itemType: string;
  materials: Array<{
    cpse: string;
    materialCode: string;
    description: string;
    attributes: Record<string, string>;
  }>;
}
