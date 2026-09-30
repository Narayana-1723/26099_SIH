import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadService } from '../services/uploadService';
import { ProcessingJob } from '../types/job';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(
    (jobId: string) => {
      stopPolling();
      pollingRef.current = window.setInterval(async () => {
        try {
          const current = await uploadService.getJobStatus(jobId);
          setJob(current);
          setError(null);
          if (current.status === 'COMPLETED' || current.status === 'FAILED') {
            stopPolling();
          }
        } catch (err: any) {
          setError(err.message || 'Error checking job status');
          stopPolling();
        }
      }, 1500);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const startUpload = async (file: File, cpse: string) => {
    setIsUploading(true);
    setError(null);
    setJob(null);
    try {
      const res = await uploadService.uploadFile(file, cpse);
      // Show the accepted job immediately. The first status poll will replace
      // this snapshot with the backend's JobProgressResponse.
      setJob(uploadService.createInitialJob(res, cpse, file.name));
      pollJobStatus(res.jobId);
      return res.jobId;
    } catch (err: any) {
      setError(err.message || 'Failed to upload material file');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    stopPolling();
    setJob(null);
    setError(null);
    setIsUploading(false);
  };

  const retryPolling = useCallback(() => {
    if (!job) return;
    setError(null);
    pollJobStatus(job.jobId);
  }, [job, pollJobStatus]);

  return {
    isUploading,
    job,
    error,
    startUpload,
    retryPolling,
    resetUpload,
  };
};
