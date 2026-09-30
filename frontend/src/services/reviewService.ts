import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { ReviewItem, ReviewActionPayload, ReviewStatus } from '../types/review';
import { DEMO_REVIEW_ITEMS } from '../data/demoData';
import { BackendHarmonizationMatch } from '../types/harmonization';

let localReviews: ReviewItem[] = [...DEMO_REVIEW_ITEMS];

const toReviewItem = (match: BackendHarmonizationMatch, status: ReviewStatus): ReviewItem => {
  const confidence = (value?: number) => {
    const score = Number(value ?? 0);
    return Math.round((score <= 1 ? score * 100 : score) * 100) / 100;
  };
  const explanation = match.explanation ?? {};
  const asStringList = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
  const matched = asStringList(explanation.matchedAttributes);
  const unmatched = asStringList(explanation.conflictingAttributes);
  const toAttribute = (entry: string) => {
    const separator = entry.indexOf(':');
    return { key: separator >= 0 ? entry.slice(0, separator).trim() : entry, sourceValue: entry, targetValue: entry };
  };
  const finalConfidence = confidence(match.finalConfidence);
  const id = String(match.id);
  const canonicalCode = match.canonicalCode ?? 'Unassigned';
  const canonicalName = match.canonicalStandardName ?? 'Canonical material unavailable';
  return {
    id,
    material: {
      id: String(match.materialId), materialCode: match.materialCode ?? `Material ${match.materialId}`,
      cpse: match.cpseCode ?? 'Unknown CPSE', originalDescription: match.materialDescription ?? '',
      normalizedDescription: match.materialDescription ?? '', category: 'Uncategorized', status: 'REVIEW_REQUIRED',
      attributes: {}, extractedAttributes: [], createdAt: match.createdAt ?? '', updatedAt: match.updatedAt ?? '',
    },
    suggestedCanonical: {
      id: String(match.canonicalMaterialId ?? ''), canonicalCode, standardName: canonicalName,
      description: canonicalName, category: 'Uncategorized', categoryPath: [], standardAttributes: {},
      sourceMaterials: [], status: 'ACTIVE', createdAt: match.createdAt ?? '', updatedAt: match.updatedAt ?? '',
    },
    scores: {
      semanticScore: confidence(match.semanticScore), lexicalScore: confidence(match.lexicalScore),
      attributeScore: confidence(match.attributeScore), finalConfidence,
    },
    explanation: {
      matchedAttributes: matched.map(toAttribute), unmatchedAttributes: unmatched.map(toAttribute),
      appliedRules: [], notes: typeof explanation.reason === 'string' ? explanation.reason : undefined,
    },
    status,
    priority: finalConfidence < 70 ? 'HIGH' : finalConfidence <= 85 ? 'MEDIUM' : 'LOW',
    createdAt: match.createdAt ?? '',
  };
};

const unwrapPage = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
};

export const reviewService = {
  getPendingReviews: async (status?: ReviewStatus): Promise<ReviewItem[]> => {
    const requestedStatus = status ?? 'PENDING';
    if (IS_DEMO_MODE) {
      await simulateLatency(250);
      return localReviews.filter((r) => r.status === requestedStatus);
    }

    // Pending work is stored as harmonization matches. Review records are created
    // only after an action, so GET /reviews cannot supply the pending queue.
    const response = await apiClient.get<unknown>('/harmonization/results', {
      params: { status: requestedStatus === 'PENDING' ? 'PENDING' : requestedStatus === 'APPROVED' || requestedStatus === 'MODIFIED' ? 'APPROVED' : 'REJECTED', page: 0, size: 100 },
    });
    return unwrapPage<BackendHarmonizationMatch>(response.data).map((match) => toReviewItem(match, requestedStatus));
  },

  getReviewById: async (id: string): Promise<ReviewItem> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(150);
      const item = localReviews.find((r) => r.id === id);
      if (!item) throw new Error('Review item not found');
      return item;
    }

    // Spring Boot REST endpoint: GET /api/reviews/{id}
    const response = await apiClient.get<ReviewItem>(`/reviews/${id}`);
    return response.data;
  },

  approveMatch: async (id: string, comments: string): Promise<{ success: boolean; message: string }> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      const idx = localReviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        localReviews[idx] = {
          ...localReviews[idx],
          status: 'APPROVED',
          reviewerComments: comments,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Authorized Reviewer',
        };
      }
      return { success: true, message: 'Material match successfully approved and harmonized' };
    }

    // Spring Boot REST endpoint: POST /api/reviews/{id}/approve
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/reviews/${id}/approve`,
      { comments }
    );
    return response.data;
  },

  rejectMatch: async (id: string, comments: string): Promise<{ success: boolean; message: string }> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      const idx = localReviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        localReviews[idx] = {
          ...localReviews[idx],
          status: 'REJECTED',
          reviewerComments: comments,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Authorized Reviewer',
        };
      }
      return { success: true, message: 'Match candidate rejected and returned to unmapped pool' };
    }

    // Spring Boot REST endpoint: POST /api/reviews/{id}/reject
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/reviews/${id}/reject`,
      { comments }
    );
    return response.data;
  },

  modifyMatch: async (
    id: string,
    payload: ReviewActionPayload
  ): Promise<{ success: boolean; message: string }> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(350);
      const idx = localReviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        localReviews[idx] = {
          ...localReviews[idx],
          status: 'MODIFIED',
          reviewerComments: payload.comments,
          modifiedAttributes: payload.modifiedAttributes,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Authorized Reviewer',
        };
      }
      return { success: true, message: 'Material match attributes updated and approved' };
    }

    // Backend accepts canonicalMaterialId/custom canonical fields plus comments and attributes.
    const { action: _action, ...request } = payload;
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/reviews/${id}/modify`,
      request
    );
    return response.data;
  },
};
