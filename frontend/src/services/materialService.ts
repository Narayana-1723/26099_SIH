import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { BackendMaterialRecord, BackendPaginatedResponse, Material, MaterialFilterParams, MaterialStatus, PaginatedResponse } from '../types/material';
import { DEMO_MATERIALS } from '../data/demoData';

interface BackendCpse {
  id: number;
  code: string;
}

let cpseDirectoryRequest: Promise<BackendCpse[]> | null = null;

const getCpseDirectory = async (): Promise<BackendCpse[]> => {
  if (!cpseDirectoryRequest) {
    cpseDirectoryRequest = apiClient.get<BackendCpse[]>('/cpse')
      .then((response) => response.data)
      .catch((error) => {
        cpseDirectoryRequest = null;
        throw error;
      });
  }
  return cpseDirectoryRequest;
};

const toAttributeValues = (raw: Record<string, unknown> | null | undefined): Record<string, string> => {
  if (!raw) return {};
  const extra = raw.additionalAttributes;
  const combined = extra && typeof extra === 'object' && !Array.isArray(extra)
    ? { ...raw, ...(extra as Record<string, unknown>) }
    : raw;
  return Object.fromEntries(
    Object.entries(combined)
      .filter(([key, value]) => key !== 'additionalAttributes' && key !== 'id' && value !== null && value !== undefined && typeof value !== 'object')
      .map(([key, value]) => [key, String(value)])
  );
};

const toMaterial = (raw: BackendMaterialRecord): Material => {
  const attributes = toAttributeValues(raw.attributes);
  const statusText = raw.status?.toUpperCase();
  const supportedStatuses: MaterialStatus[] = [
    'RAW', 'NORMALIZED', 'MATCHED', 'HARMONIZED', 'PENDING_REVIEW',
    'REVIEW_REQUIRED', 'PROCESSED', 'PROCESSING', 'REJECTED',
  ];
  const status = supportedStatuses.includes(statusText as MaterialStatus)
    ? statusText as MaterialStatus
    : 'RAW';
  const originalDescription = raw.originalDescription || '';

  return {
    id: String(raw.id),
    materialCode: raw.originalMaterialCode || String(raw.id),
    cpse: raw.cpseCode || 'Unknown CPSE',
    originalDescription,
    normalizedDescription: raw.normalizedDescription || originalDescription,
    category: attributes.category || 'Uncategorized',
    subCategory: attributes.itemType,
    status,
    attributes,
    extractedAttributes: Object.entries(attributes)
      .filter(([key, value]) => !['category', 'itemType'].includes(key) && value.trim() !== '')
      .map(([key, value]) => ({ key, label: key, value, confidence: 0 })),
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || raw.createdAt || '',
  };
};

const toFrontendPage = (
  response: BackendPaginatedResponse<BackendMaterialRecord>,
  requestedPage: number,
  requestedPageSize: number,
): PaginatedResponse<Material> => {
  if (!response || !Array.isArray(response.data)) {
    throw new Error('The materials API returned an invalid paginated response.');
  }
  const pageSize = response.size || response.pageSize || requestedPageSize;
  return {
    data: response.data.map(toMaterial),
    total: response.totalElements ?? response.total ?? response.data.length,
    page: Number.isFinite(response.page) ? response.page + 1 : requestedPage,
    pageSize,
    totalPages: response.totalPages ?? Math.ceil((response.totalElements ?? response.data.length) / pageSize),
  };
};

const getBackendPage = async (params?: MaterialFilterParams): Promise<PaginatedResponse<Material>> => {
  const requestedPage = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, params?.pageSize || 10);
  const requestParams: Record<string, string | number> = {
    page: requestedPage - 1,
    size: pageSize,
    sortBy: 'id',
    sortDirection: params?.sortOrder?.toUpperCase() || 'ASC',
  };

  if (params?.category && params.category !== 'ALL') requestParams.category = params.category;
  if (params?.status && params.status !== 'ALL') requestParams.status = params.status;

  if (params?.cpse && params.cpse !== 'ALL') {
    const cpses = await getCpseDirectory();
    const cpse = cpses.find((entry) => entry.code.toLowerCase() === params.cpse?.toLowerCase());
    if (!cpse) throw new Error(`CPSE '${params.cpse}' is not present in the backend CPSE directory.`);
    requestParams.cpseId = cpse.id;
  }

  const search = params?.search?.trim();
  const endpoint = search ? '/materials/search' : '/materials';
  if (search) requestParams.query = search;

  const response = await apiClient.get<BackendPaginatedResponse<BackendMaterialRecord>>(endpoint, {
    params: requestParams,
  });
  return toFrontendPage(response.data, requestedPage, pageSize);
};

export const materialService = {
  getMaterials: async (params?: MaterialFilterParams): Promise<PaginatedResponse<Material>> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      let list = [...DEMO_MATERIALS];

      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (m) =>
            m.materialCode.toLowerCase().includes(q) ||
            m.originalDescription.toLowerCase().includes(q) ||
            m.normalizedDescription.toLowerCase().includes(q)
        );
      }

      if (params?.cpse && params.cpse !== 'ALL') {
        list = list.filter((m) => m.cpse === params.cpse);
      }

      if (params?.category && params.category !== 'ALL') {
        list = list.filter((m) => m.category === params.category);
      }

      if (params?.status && params.status !== 'ALL') {
        list = list.filter((m) => m.status === params.status);
      }

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const total = list.length;
      const totalPages = Math.ceil(total / pageSize);
      const data = list.slice((page - 1) * pageSize, page * pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    return getBackendPage(params);
  },

  getMaterialById: async (id: string): Promise<Material> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      const found = DEMO_MATERIALS.find((m) => m.id === id || m.materialCode === id);
      if (!found) {
        throw new Error(`Material with ID ${id} not found.`);
      }
      return found;
    }

    // Spring Boot REST endpoint: GET /api/materials/{id}
    const response = await apiClient.get<BackendMaterialRecord>(`/materials/${id}`);
    return toMaterial(response.data);
  },

  searchMaterials: async (query: string): Promise<Material[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      const q = query.toLowerCase();
      return DEMO_MATERIALS.filter(
        (m) =>
          m.materialCode.toLowerCase().includes(q) ||
          m.originalDescription.toLowerCase().includes(q) ||
          m.normalizedDescription.toLowerCase().includes(q)
      );
    }

    // The backend search endpoint returns the same paginated shape as /materials.
    const response = await getBackendPage({ page: 1, pageSize: 100, search: query });
    return response.data;
  },
};
