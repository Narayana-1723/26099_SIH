export interface OverviewStats {
  totalMaterials: number;
  processedMaterials: number;
  harmonizedMaterials: number;
  pendingReviews: number;
  potentialDuplicates: number;
  unmappedMaterials: number;
  canonicalMaterialsCount: number;
  overallAccuracyRate: number; // e.g. 94.8%
  activeCPSEsCount: number;
}

export interface CPSEHarmonizationStat {
  cpse: string;
  totalMaterials: number;
  harmonized: number;
  pendingReview: number;
  duplicates: number;
  accuracyRate: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
  harmonizedCount: number;
}

export interface MonthlyProcessingTrend {
  month: string;
  uploaded: number;
  harmonized: number;
  reviewed: number;
}

export interface ConfidenceDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface MLModelStatus {
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastHealthCheck: string;
  version: string;
  models: {
    nerModel: { name: string; version: string; status: string; latencyMs: number };
    embeddingModel: { name: string; version: string; dimensions: number; latencyMs: number };
    classificationModel: { name: string; version: string; status: string; latencyMs: number };
    vectorIndex: { engine: string; totalVectors: number; status: string };
  };
  metrics: {
    requestsProcessedLast24h: number;
    averageLatencyMs: number;
    errorRatePercent: number;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  employeeId: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: string;
  ipAddress?: string;
}
