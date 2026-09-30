export type MaterialStatus = 
  | 'RAW' 
  | 'NORMALIZED' 
  | 'MATCHED' 
  | 'HARMONIZED' 
  | 'PENDING_REVIEW' 
  | 'REVIEW_REQUIRED'
  | 'PROCESSED'
  | 'PROCESSING'
  | 'REJECTED';

export interface ExtractedAttribute {
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: number;
}

export interface MaterialAuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface Material {
  id: string;
  materialCode: string; // Original CPSE material code
  cpse: string; // e.g. ONGC, BHEL, NTPC
  originalDescription: string;
  normalizedDescription: string;
  category: string;
  subCategory?: string;
  status: MaterialStatus;
  canonicalCode?: string; // Mapped canonical material code, e.g. CM-000124
  canonicalName?: string;
  attributes: Record<string, string>;
  extractedAttributes: ExtractedAttribute[];
  confidenceScore?: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  auditTrail?: MaterialAuditEntry[];
}

export interface MaterialFilterParams {
  search?: string;
  cpse?: string;
  category?: string;
  status?: MaterialStatus | 'ALL';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Material catalog DTO returned by the Spring Boot API. */
export interface BackendMaterialRecord {
  id: number;
  cpseId?: number | null;
  cpseCode?: string | null;
  originalMaterialCode?: string | null;
  originalDescription?: string | null;
  normalizedDescription?: string | null;
  status?: string | null;
  attributes?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
}
