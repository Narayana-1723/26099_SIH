import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { CanonicalMaterial } from '../types/canonical';
import { DEMO_CANONICAL_MATERIALS } from '../data/demoData';

let localCanonicals: CanonicalMaterial[] = [...DEMO_CANONICAL_MATERIALS];

interface BackendCanonical {
  id: number;
  canonicalCode: string;
  standardName: string;
  category?: string | null;
  taxonomyName?: string | null;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const mapCanonical = (item: BackendCanonical): CanonicalMaterial => ({
  id: String(item.id), canonicalCode: item.canonicalCode, standardName: item.standardName,
  description: item.description ?? '', category: item.category ?? item.taxonomyName ?? 'Uncategorized',
  categoryPath: [item.taxonomyName ?? item.category ?? 'Uncategorized'], standardAttributes: {},
  sourceMaterials: [], status: item.status === 'DRAFT' || item.status === 'DEPRECATED' ? item.status : 'ACTIVE',
  createdAt: item.createdAt ?? '', updatedAt: item.updatedAt ?? '',
});

const listFromPage = (payload: unknown): BackendCanonical[] => {
  if (Array.isArray(payload)) return payload as BackendCanonical[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: BackendCanonical[] }).data;
  }
  return [];
};

export const canonicalService = {
  getCanonicalMaterials: async (search?: string, category?: string): Promise<CanonicalMaterial[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      let list = [...localCanonicals];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.canonicalCode.toLowerCase().includes(q) ||
            c.standardName.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
      }
      if (category && category !== 'ALL') {
        list = list.filter((c) => c.category === category);
      }
      return list;
    }

    // Backend returns a paginated DTO and calls the search parameter `query`.
    const response = await apiClient.get<unknown>('/canonical-materials', {
      params: { query: search?.trim() || undefined, page: 0, size: 100 },
    });
    let items = listFromPage(response.data).map(mapCanonical);
    if (category && category !== 'ALL') items = items.filter((item) => item.category === category);
    return items;
  },

  getCanonicalById: async (id: string): Promise<CanonicalMaterial> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(150);
      const found = localCanonicals.find((c) => c.id === id || c.canonicalCode === id);
      if (!found) throw new Error(`Canonical material ${id} not found.`);
      return found;
    }

    // Spring Boot REST endpoint: GET /api/canonical-materials/{id}
    const response = await apiClient.get<BackendCanonical>(`/canonical-materials/${id}`);
    return mapCanonical(response.data);
  },

  createCanonical: async (data: Partial<CanonicalMaterial>): Promise<CanonicalMaterial> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      const newCm: CanonicalMaterial = {
        id: `cm-${Date.now().toString().slice(-4)}`,
        canonicalCode: data.canonicalCode || `CM-000${Math.floor(Math.random() * 900) + 100}`,
        standardName: data.standardName || 'Standard Material',
        description: data.description || '',
        category: data.category || 'Mechanical',
        categoryPath: data.categoryPath || ['Mechanical'],
        unspscCode: data.unspscCode,
        standardAttributes: data.standardAttributes || {},
        sourceMaterials: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localCanonicals.unshift(newCm);
      return newCm;
    }

    // Spring Boot REST endpoint: POST /api/canonical-materials
    const request = {
      canonicalCode: data.canonicalCode,
      standardName: data.standardName,
      category: data.category,
      description: data.description,
      status: data.status,
    };
    const response = await apiClient.post<BackendCanonical>('/canonical-materials', request);
    return mapCanonical(response.data);
  },
};
