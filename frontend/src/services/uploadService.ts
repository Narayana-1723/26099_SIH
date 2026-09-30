import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { BackendJobProgress, JobStatus, ProcessingJob, UploadJobSummary } from '../types/job';

// In-memory job tracker for demo simulation
const demoJobs: Map<string, ProcessingJob> = new Map();
const uploadContext = new Map<string, { fileName: string; cpse: string }>();

const toNullableCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
};

const normalizeStatus = (value: unknown): JobStatus => {
  if (typeof value !== 'string') return 'QUEUED';
  const status = value.toUpperCase();
  return status === 'PROCESSING' || status === 'COMPLETED' || status === 'FAILED' || status === 'QUEUED'
    ? status
    : 'QUEUED';
};

const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim() || Number.isNaN(Date.parse(value))) return null;
  return value;
};

const createInitialJob = (summary: UploadJobSummary, cpse: string, fallbackFileName: string): ProcessingJob => {
  const context = uploadContext.get(summary.jobId);
  const received = toNullableCount(summary.recordsReceived);
  return {
    jobId: summary.jobId,
    fileName: summary.fileName || context?.fileName || fallbackFileName,
    cpse: context?.cpse || cpse,
    totalRecords: received,
    processedRecords: 0,
    failedRecords: 0,
    harmonizedRecords: null,
    status: normalizeStatus(summary.status),
    progressPercent: summary.status?.toUpperCase() === 'COMPLETED' ? 100 : 0,
    currentStep: summary.status?.toUpperCase() === 'COMPLETED' ? 'DONE' : null,
    startedAt: null,
    completedAt: null,
    errorMessage: null,
  };
};

const mapProgressResponse = (raw: BackendJobProgress, jobId: string): ProcessingJob => {
  const context = uploadContext.get(jobId);
  const status = normalizeStatus(raw.status);
  const totalRecords = toNullableCount(raw.totalRecords);
  const processedRecords = toNullableCount(raw.processedRecords);
  const failedRecords = toNullableCount(raw.failedRecords);
  const reportedProgress = toNullableCount(raw.progress);
  const calculatedProgress = totalRecords && totalRecords > 0 && processedRecords !== null && failedRecords !== null
    ? Math.floor(((processedRecords + failedRecords) / totalRecords) * 100)
    : status === 'COMPLETED' ? 100 : 0;
  const progressPercent = status === 'COMPLETED'
    ? 100
    : Math.min(100, reportedProgress ?? calculatedProgress);

  return {
    jobId: raw.jobId || jobId,
    fileName: context?.fileName || 'Unknown file',
    cpse: context?.cpse || 'Unknown CPSE',
    totalRecords,
    processedRecords,
    failedRecords,
    // The backend response has no harmonizedRecords field; do not invent a count.
    harmonizedRecords: null,
    status,
    progressPercent,
    // JobProgressResponse currently has no currentStep field.
    currentStep: status === 'COMPLETED' ? 'DONE' : null,
    startedAt: normalizeDate(raw.startedAt),
    completedAt: normalizeDate(raw.completedAt),
    errorMessage: typeof raw.errorMessage === 'string' ? raw.errorMessage : null,
  };
};

export const uploadService = {
  uploadFile: async (file: File, cpse: string): Promise<UploadJobSummary> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(500);
      const jobId = `JOB-${Date.now().toString().slice(-6)}`;
      const totalRecords = Math.floor(Math.random() * 500) + 150;

      const job: ProcessingJob = {
        jobId,
        fileName: file.name,
        cpse,
        totalRecords,
        processedRecords: 0,
        failedRecords: 0,
        harmonizedRecords: 0,
        status: 'QUEUED',
        progressPercent: 5,
        currentStep: 'UPLOADING',
        startedAt: new Date().toISOString(),
      };

      demoJobs.set(jobId, job);
      uploadContext.set(jobId, { fileName: file.name, cpse });
      return {
        jobId,
        status: 'QUEUED',
        recordsReceived: totalRecords,
        fileName: file.name,
        message: 'File accepted for processing job',
      };
    }

    // Spring Boot REST endpoint: POST /api/materials/upload (multipart/form-data)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cpse', cpse);

    const response = await apiClient.post<UploadJobSummary>(
      '/materials/upload',
      formData
    );
    const summary = response.data;
    if (!summary?.jobId) {
      throw new Error('The upload was accepted without a job ID. The job cannot be tracked.');
    }
    uploadContext.set(summary.jobId, {
      fileName: summary.fileName || file.name,
      cpse,
    });
    return { ...summary, fileName: summary.fileName || file.name };
  },

  createInitialJob: (summary: UploadJobSummary, cpse: string, fileName: string): ProcessingJob =>
    createInitialJob(summary, cpse, fileName),

  getJobStatus: async (jobId: string): Promise<ProcessingJob> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(150);
      let job = demoJobs.get(jobId);
      if (!job) {
        // Create an active job if not found
          job = {
          jobId,
          fileName: 'material_procurement_data.csv',
          cpse: 'ONGC',
          totalRecords: 280,
          processedRecords: 140,
          failedRecords: 2,
          harmonizedRecords: 120,
          status: 'PROCESSING',
          progressPercent: 50,
          currentStep: 'SEMANTIC_MATCHING',
          startedAt: new Date().toISOString(),
        };
        demoJobs.set(jobId, job);
      }

      // Simulate step progression on polling
      const totalRecords = job.totalRecords ?? 0;
      if (job.status === 'QUEUED') {
        job.status = 'PROCESSING';
        job.currentStep = 'VALIDATING';
        job.progressPercent = 20;
      } else if (job.status === 'PROCESSING') {
        if (job.progressPercent < 40) {
          job.currentStep = 'NORMALIZING';
          job.progressPercent = 45;
          job.processedRecords = Math.floor(totalRecords * 0.45);
        } else if (job.progressPercent < 75) {
          job.currentStep = 'EXTRACTING_ATTRIBUTES';
          job.progressPercent = 75;
          job.processedRecords = Math.floor(totalRecords * 0.75);
        } else if (job.progressPercent < 95) {
          job.currentStep = 'SEMANTIC_MATCHING';
          job.progressPercent = 95;
          job.processedRecords = Math.floor(totalRecords * 0.95);
        } else {
          job.status = 'COMPLETED';
          job.currentStep = 'DONE';
          job.progressPercent = 100;
          job.processedRecords = totalRecords;
          job.harmonizedRecords = Math.floor(totalRecords * 0.88);
          job.failedRecords = Math.floor(totalRecords * 0.02);
          job.completedAt = new Date().toISOString();
        }
      }

      return { ...job };
    }

    // Spring Boot REST endpoint: GET /api/jobs/{jobId}
    const response = await apiClient.get<BackendJobProgress>(`/jobs/${jobId}`);
    const job = mapProgressResponse(response.data, jobId);
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      uploadContext.delete(jobId);
    }
    return job;
  },
};
