export interface TaxonomyNode {
  id: string;
  code: string;
  name: string;
  depth: number;
  parentId?: string | null;
  unspscCode?: string;
  canonicalCount: number;
  materialsCount: number;
  children?: TaxonomyNode[];
}

export interface TaxonomyCreatePayload {
  code: string;
  name: string;
  parentId?: string | null;
  unspscCode?: string;
  description?: string;
}
