export interface SourceMaterialRef {
  cpse: string;
  materialCode: string;
  originalDescription: string;
  mappedAt: string;
  mappedBy: string;
}

export interface CanonicalMaterial {
  id: string;
  canonicalCode: string; // e.g. CM-000124
  standardName: string;
  description: string;
  category: string;
  categoryPath: string[]; // ['Mechanical', 'Fasteners', 'Bolts']
  unspscCode?: string;
  standardAttributes: Record<string, string>;
  sourceMaterials: SourceMaterialRef[];
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  createdAt: string;
  updatedAt: string;
}
