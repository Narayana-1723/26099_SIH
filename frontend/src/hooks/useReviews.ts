import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { ReviewItem, ReviewStatus, ReviewActionPayload } from '../types/review';

export const useReviews = (initialStatus: ReviewStatus = 'PENDING') => {
  const [status, setStatus] = useState<ReviewStatus>(initialStatus);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewService.getPendingReviews(status);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load review items');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approve = async (id: string, comments: string) => {
    await reviewService.approveMatch(id, comments);
    await fetchReviews();
  };

  const reject = async (id: string, comments: string) => {
    await reviewService.rejectMatch(id, comments);
    await fetchReviews();
  };

  const modify = async (id: string, payload: ReviewActionPayload) => {
    await reviewService.modifyMatch(id, payload);
    await fetchReviews();
  };

  return {
    reviews,
    status,
    setStatus,
    isLoading,
    error,
    approve,
    reject,
    modify,
    refetch: fetchReviews,
  };
};
