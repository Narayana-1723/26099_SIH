import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { OverviewStats, CPSEHarmonizationStat, CategoryStat, MonthlyProcessingTrend } from '../types/analytics';
import {
  DEMO_OVERVIEW_STATS,
  DEMO_CPSE_STATS,
  DEMO_CATEGORY_STATS,
  DEMO_MONTHLY_TRENDS,
} from '../data/demoData';

export const analyticsService = {
  getOverview: async (): Promise<OverviewStats> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return DEMO_OVERVIEW_STATS;
    }

    // Spring Boot REST endpoint: GET /api/analytics/overview
    const response = await apiClient.get<OverviewStats>('/analytics/overview');
    return response.data;
  },

  getCPSEBreakdown: async (): Promise<CPSEHarmonizationStat[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(250);
      return DEMO_CPSE_STATS;
    }

    // Spring Boot REST endpoint: GET /api/analytics/cpse
    const response = await apiClient.get<CPSEHarmonizationStat[]>('/analytics/cpse');
    return response.data;
  },

  getCategoryDistribution: async (): Promise<CategoryStat[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return DEMO_CATEGORY_STATS;
    }

    // Spring Boot REST endpoint: GET /api/analytics/categories
    const response = await apiClient.get<CategoryStat[]>('/analytics/categories');
    return response.data;
  },

  getProcessingTrends: async (): Promise<MonthlyProcessingTrend[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return DEMO_MONTHLY_TRENDS;
    }

    // Spring Boot REST endpoint: GET /api/analytics/trends
    const response = await apiClient.get<MonthlyProcessingTrend[]>('/analytics/trends');
    return response.data;
  },

  generateReport: async (params: { cpse?: string; category?: string; format: 'CSV' | 'PDF' }): Promise<{ downloadUrl: string; reportId: string }> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(600);
      return {
        downloadUrl: '#demo-download',
        reportId: `REP-${Date.now().toString().slice(-6)}`,
      };
    }

    // Spring Boot REST endpoint: POST /api/reports/generate
    const response = await apiClient.post<{ downloadUrl: string; reportId: string }>(
      '/reports/generate',
      params
    );
    return response.data;
  },
};
