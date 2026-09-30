export interface CPSE {
  code: string;
  name: string;
  ministry: string;
  sector: 'Energy' | 'Heavy Engineering' | 'Petroleum' | 'Steel' | 'Mining' | 'Power' | 'Other';
  materialsCount: number;
  harmonizedCount: number;
  status: 'ACTIVE' | 'INTEGRATED' | 'PENDING';
}
