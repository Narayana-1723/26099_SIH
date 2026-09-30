import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { HarmonizationResult, DuplicateGroup, HarmonizationMatchCandidate, BackendHarmonizationMatch, BackendMaterialPage, BackendMaterialRecord } from '../types/harmonization';
import { Material } from '../types/material';
import { DEMO_MATERIALS, DEMO_CANONICAL_MATERIALS, DEMO_DUPLICATES } from '../data/demoData';

export const harmonizationService = {
  getMaterialsForMatching: async (): Promise<Material[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return DEMO_MATERIALS;
    }

    const pageSize = 100;
    const materials: BackendMaterialRecord[] = [];
    let page = 0;
    let totalPages = 1;

    while (page < totalPages) {
      const response = await apiClient.get<BackendMaterialPage>('/materials', {
        params: { page, size: pageSize, sortBy: 'id', sortDirection: 'ASC' },
      });
      const result = response.data;
      if (!result || !Array.isArray(result.data)) {
        throw new Error('The materials API returned an invalid page response.');
      }

      materials.push(...result.data);
      totalPages = result.totalPages;
      page += 1;
    }

    return materials.map((item) => {
      const rawAttributes = item.attributes || {};
      const attributes = Object.fromEntries(
        Object.entries(rawAttributes)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) => [key, String(value)])
      );

      return {
        id: String(item.id),
        materialCode: item.originalMaterialCode || String(item.id),
        cpse: item.cpseCode || 'Unknown CPSE',
        originalDescription: item.originalDescription || '',
        normalizedDescription: item.normalizedDescription || item.originalDescription || '',
        category: attributes.category || 'Uncategorized',
        subCategory: attributes.itemType,
        status: (item.status || 'RAW') as Material['status'],
        attributes,
        extractedAttributes: Object.entries(attributes)
        .filter(([key, value]) => !['id', 'category', 'itemType'].includes(key) && value.trim() !== '')
          .map(([key, value]) => ({ key, label: key, value, confidence: 0 })),
        createdAt: item.createdAt || '',
        updatedAt: item.updatedAt || item.createdAt || '',
      };
    });
  },

  getHarmonizationMatches: async (materialId: string): Promise<HarmonizationResult> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(350);
      const material = DEMO_MATERIALS.find((m) => m.id === materialId) || DEMO_MATERIALS[0];

      // Build realistic candidates
      const candidates: HarmonizationMatchCandidate[] = [
        {
          canonicalMaterial: DEMO_CANONICAL_MATERIALS[0],
          scores: {
            semanticScore: 94,
            attributeScore: 100,
            lexicalScore: 89,
            finalConfidence: 95,
          },
          explanation: {
            matchedAttributes: [
              { key: 'Item Type', sourceValue: 'Hex Bolt', targetValue: 'Hex Bolt' },
              { key: 'Material', sourceValue: 'Stainless Steel', targetValue: 'Stainless Steel' },
              { key: 'Grade', sourceValue: 'SS316', targetValue: 'SS316' },
              { key: 'Diameter', sourceValue: 'M16', targetValue: 'M16' },
              { key: 'Length', sourceValue: '50 mm', targetValue: '50 mm' },
            ],
            unmatchedAttributes: [],
            appliedRules: [
              'Exact match on critical mechanical dimensions (M16 x 50mm)',
              'Material grade SS316 matches austenitic 316 standard',
              'High semantic cosine similarity (>0.92) across embeddings',
            ],
            notes: 'Strong candidate for automated reconciliation.',
          },
          recommendationLevel: 'HIGH_CONFIDENCE',
        },
        {
          canonicalMaterial: {
            ...DEMO_CANONICAL_MATERIALS[0],
            id: 'cm-alt-1',
            canonicalCode: 'CM-000189',
            standardName: 'Stainless Steel 304 Hex Bolt M16 × 50 mm',
          },
          scores: {
            semanticScore: 86,
            attributeScore: 80,
            lexicalScore: 84,
            finalConfidence: 82,
          },
          explanation: {
            matchedAttributes: [
              { key: 'Item Type', sourceValue: 'Hex Bolt', targetValue: 'Hex Bolt' },
              { key: 'Diameter', sourceValue: 'M16', targetValue: 'M16' },
              { key: 'Length', sourceValue: '50 mm', targetValue: '50 mm' },
            ],
            unmatchedAttributes: [
              { key: 'Material Grade', sourceValue: 'SS316', targetValue: 'SS304' },
            ],
            appliedRules: ['Grade mismatch: SS316 vs SS304 requires reviewer consent'],
          },
          recommendationLevel: 'MEDIUM_CONFIDENCE',
        },
      ];

      return {
        material,
        candidates,
        topMatch: candidates[0],
      };
    }

    throw new Error('Direct match retrieval is only available in demo mode. Use triggerMatch with a backend material.');
  },

  getDuplicates: async (): Promise<DuplicateGroup[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(250);
      return DEMO_DUPLICATES;
    }

    // Spring Boot REST endpoint: GET /api/harmonization/duplicates
    const response = await apiClient.get<DuplicateGroup[]>('/harmonization/duplicates');
    const payload = response.data as unknown;
    if (!Array.isArray(payload)) {
      throw new Error('The duplicates API returned an invalid response. Expected a list of duplicate groups.');
    }
    return payload.map((group: any, index: number) => ({
      ...group,
      id: String(group.id ?? `duplicate-${index}`),
      canonicalCandidateName: String(group.canonicalCandidateName ?? 'Unnamed material'),
      itemType: String(group.itemType ?? 'Material group'),
      confidence: Number.isFinite(Number(group.confidence)) ? Number(group.confidence) : 0,
      materials: Array.isArray(group.materials) ? group.materials.map((material: any) => ({
        ...material,
        cpse: String(material.cpse ?? 'Unknown CPSE'),
        materialCode: String(material.materialCode ?? '—'),
        description: String(material.description ?? ''),
        attributes: material.attributes && typeof material.attributes === 'object'
          ? Object.fromEntries(Object.entries(material.attributes).map(([key, value]) => [key, String(value ?? '')]))
          : {},
      })) : [],
    }));
  },

  triggerMatch: async (material: Material): Promise<HarmonizationResult> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(500);
      return harmonizationService.getHarmonizationMatches(material.id);
    }

    const numericMaterialId = Number(material.id);
    if (!/^\d+$/.test(material.id) || !Number.isSafeInteger(numericMaterialId)) {
      throw new Error('This material does not have a valid numeric backend ID. Refresh the material list and try again.');
    }

    // Spring Boot REST endpoint: POST /api/harmonization/match
    const response = await apiClient.post<BackendHarmonizationMatch>('/harmonization/match', {
      materialId: numericMaterialId,
    });
    const match = response.data;
    if (!match || typeof match.finalConfidence !== 'number') {
      throw new Error('The harmonization API returned an invalid match response.');
    }

    const details = match.explanation || {};
    const matched = Array.isArray(details.matchedAttributes) ? details.matchedAttributes : [];
    const conflicts = Array.isArray(details.conflictingAttributes) ? details.conflictingAttributes : [];
    const matchedAttributes = matched.map((entry) => {
      const text = String(entry);
      const separator = text.indexOf(':');
      return {
        key: separator >= 0 ? text.slice(0, separator).trim() : 'Matched attribute',
        sourceValue: separator >= 0 ? text.slice(separator + 1).trim() : text,
        targetValue: 'Matched in canonical specification',
      };
    });
    const unmatchedAttributes = conflicts.map((entry) => {
      const text = String(entry);
      const matchParts = text.match(/^(.+?) mismatch:\s*'([^']*)'\s*vs\s*'([^']*)'$/i);
      return matchParts
        ? { key: matchParts[1], sourceValue: matchParts[2], targetValue: matchParts[3] }
        : { key: 'Difference', sourceValue: text };
    });

    const candidate: HarmonizationMatchCandidate = {
      canonicalMaterial: {
        id: String(match.canonicalMaterialId ?? match.id),
        canonicalCode: match.canonicalCode || 'No canonical code',
        standardName: match.canonicalStandardName || 'Canonical material details unavailable',
        description: '',
        category: 'Unspecified',
        categoryPath: [],
        standardAttributes: {},
        sourceMaterials: [],
        status: 'ACTIVE',
        createdAt: match.createdAt || '',
        updatedAt: match.updatedAt || match.createdAt || '',
      },
      scores: {
        semanticScore: Math.round(match.semanticScore * 100),
        lexicalScore: Math.round(match.lexicalScore * 100),
        attributeScore: Math.round(match.attributeScore * 100),
        finalConfidence: Math.round(match.finalConfidence * 100),
      },
      explanation: {
        matchedAttributes,
        unmatchedAttributes,
        appliedRules: conflicts.map(String),
        notes: typeof details.reason === 'string' ? details.reason : undefined,
      },
      recommendationLevel: match.finalConfidence >= 0.85
        ? 'HIGH_CONFIDENCE'
        : match.finalConfidence >= 0.65
          ? 'MEDIUM_CONFIDENCE'
          : 'LOW_CONFIDENCE',
    };

    const matchedMaterial: Material = {
      ...material,
      id: String(match.materialId),
      materialCode: match.materialCode || material.materialCode,
      cpse: match.cpseCode || material.cpse,
      originalDescription: match.materialDescription || material.originalDescription,
      normalizedDescription: match.materialDescription || material.normalizedDescription,
    };

    return { material: matchedMaterial, candidates: [candidate], topMatch: candidate };
  },
};
