import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { TaxonomyNode, TaxonomyCreatePayload } from '../types/taxonomy';
import { DEMO_TAXONOMY } from '../data/demoData';

let localTaxonomy: TaxonomyNode[] = JSON.parse(JSON.stringify(DEMO_TAXONOMY));

const normalizeNode = (node: any): TaxonomyNode => ({
  ...node,
  id: String(node.id ?? ''),
  code: String(node.code ?? ''),
  name: String(node.name ?? 'Unnamed category'),
  depth: Number.isFinite(Number(node.depth)) ? Number(node.depth) : 0,
  canonicalCount: Number.isFinite(Number(node.canonicalCount)) ? Number(node.canonicalCount) : 0,
  materialsCount: Number.isFinite(Number(node.materialsCount)) ? Number(node.materialsCount) : 0,
  children: Array.isArray(node.children) ? node.children.map(normalizeNode) : [],
});

export const taxonomyService = {
  getTaxonomyTree: async (): Promise<TaxonomyNode[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return localTaxonomy;
    }

    // Spring Boot REST endpoint: GET /api/taxonomy
    const response = await apiClient.get<TaxonomyNode[]>('/taxonomy');
    const payload = response.data as unknown;
    if (!Array.isArray(payload)) {
      throw new Error('The taxonomy API returned an invalid response. Expected a list of taxonomy nodes.');
    }
    return payload.map(normalizeNode);
  },

  getTaxonomyNodeById: async (id: string): Promise<TaxonomyNode | null> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(150);
      const findNode = (nodes: TaxonomyNode[]): TaxonomyNode | null => {
        for (const n of nodes) {
          if (n.id === id || n.code === id) return n;
          if (n.children) {
            const res = findNode(n.children);
            if (res) return res;
          }
        }
        return null;
      };
      return findNode(localTaxonomy);
    }

    // Spring Boot REST endpoint: GET /api/taxonomy/{id}
    const response = await apiClient.get<TaxonomyNode>(`/taxonomy/${id}`);
    return response.data;
  },

  createNode: async (payload: TaxonomyCreatePayload): Promise<TaxonomyNode> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      const newNode: TaxonomyNode = {
        id: `tax-${Date.now().toString().slice(-4)}`,
        code: payload.code,
        name: payload.name,
        depth: payload.parentId ? 1 : 0,
        parentId: payload.parentId,
        unspscCode: payload.unspscCode,
        canonicalCount: 0,
        materialsCount: 0,
      };

      if (payload.parentId) {
        const parent = localTaxonomy.find((n) => n.id === payload.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(newNode);
        } else {
          localTaxonomy.push(newNode);
        }
      } else {
        localTaxonomy.push(newNode);
      }

      return newNode;
    }

    // Spring Boot REST endpoint: POST /api/taxonomy
    const response = await apiClient.post<TaxonomyNode>('/taxonomy', payload);
    return response.data;
  },
};
