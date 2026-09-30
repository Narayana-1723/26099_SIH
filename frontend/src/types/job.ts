export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type JobStep = 'UPLOADING' | 'VALIDATING' | 'NORMALIZING' | 'EXTRACTING_ATTRIBUTES' | 'SEMANTIC_MATCHING' | 'STORING' | 'DONE';

/** Upload response returned by JobSummaryDto. */
export interface UploadJobSummary {
  jobId: string;
  status?: JobStatus;
  recordsReceived?: number | null;
  fileName?: string | null;
  message?: string;
}

/** Progress response returned by JobProgressResponse. */
export interface BackendJobProgress {
  jobId?: string | null;
  status?: string | null;
  totalRecords?: number | null;
  processedRecords?: number | null;
  failedRecords?: number | null;
  progress?: number | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ProcessingJob {
  jobId: string;
  fileName: string;
  cpse: string;
  totalRecords: number | null;
  processedRecords: number | null;
  failedRecords: number | null;
  /** Not currently reported by the backend job-progress endpoint. */
  harmonizedRecords: number | null;
  status: JobStatus;
  progressPercent: number;
  /** The backend reports overall progress, but not the pipeline stage. */
  currentStep: JobStep | null;
  startedAt: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
}
