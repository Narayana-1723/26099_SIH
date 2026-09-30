import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { OverviewStats, CPSEHarmonizationStat, CategoryStat, MonthlyProcessingTrend } from '../types/analytics';

export const useAnalytics = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [cpseStats, setCpseStats] = useState<CPSEHarmonizationStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [trends, setTrends] = useState<MonthlyProcessingTrend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ov, cp, cat, tr] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getCPSEBreakdown(),
          analyticsService.getCategoryDistribution(),
          analyticsService.getProcessingTrends(),
        ]);
        setOverview(ov);
        setCpseStats(cp);
        setCategoryStats(cat);
        setTrends(tr);
      } catch (err: any) {
        setError(err.message || 'Failed to load enterprise analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllMetrics();
  }, []);

  return {
    overview,
    cpseStats,
    categoryStats,
    trends,
    isLoading,
    error,
  };
};
