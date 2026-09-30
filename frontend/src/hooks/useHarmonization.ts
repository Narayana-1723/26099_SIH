import { useState, useCallback } from 'react';
import { harmonizationService } from '../services/harmonizationService';
import { HarmonizationResult, DuplicateGroup } from '../types/harmonization';
import { Material } from '../types/material';
import axios from 'axios';

const getRequestError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
    if (!error.response) return 'Cannot reach the API. Check that the backend is running and the API URL is configured correctly.';
    if (error.response.status >= 500) return `The backend failed while processing this request (HTTP ${error.response.status}). Check the backend logs for details.`;
    return `The API request failed (HTTP ${error.response.status}).`;
  }
  return error instanceof Error ? error.message : fallback;
};

export const useHarmonization = () => {
  const [result, setResult] = useState<HarmonizationResult | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsMaterialsLoading(true);
    setMaterialsError(null);
    try {
      const data = await harmonizationService.getMaterialsForMatching();
      setMaterials(data);
      return data;
    } catch (err: any) {
      const message = getRequestError(err, 'Failed to load materials');
      setMaterialsError(message);
      setMaterials([]);
      return [];
    } finally {
      setIsMaterialsLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async (material: Material) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await harmonizationService.triggerMatch(material);
      setResult(data);
    } catch (err: any) {
      setError(getRequestError(err, 'Failed to fetch harmonization matches'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDuplicates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await harmonizationService.getDuplicates();
      setDuplicates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load duplicate groups');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    result,
    duplicates,
    materials,
    isMaterialsLoading,
    materialsError,
    isLoading,
    error,
    fetchMaterials,
    fetchMatches,
    fetchDuplicates,
  };
};
