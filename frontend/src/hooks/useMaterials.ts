import { useState, useEffect, useCallback } from 'react';
import { Material, MaterialFilterParams, PaginatedResponse } from '../types/material';
import { materialService } from '../services/materialService';

export const useMaterials = (initialParams?: MaterialFilterParams) => {
  const [params, setParams] = useState<MaterialFilterParams>(initialParams || { page: 1, pageSize: 10 });
  const [data, setData] = useState<PaginatedResponse<Material>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterials(params);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const updateFilters = (newFilters: Partial<MaterialFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    materials: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    isLoading,
    error,
    params,
    setPage,
    updateFilters,
    refetch: fetchMaterials,
  };
};
