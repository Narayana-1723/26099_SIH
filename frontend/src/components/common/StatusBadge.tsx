import React from 'react';
import { MaterialStatus } from '../../types/material';
import { JobStatus } from '../../types/job';
import { ReviewStatus } from '../../types/review';
import { CheckCircle2, Clock, XCircle, Sparkles, FileText, HelpCircle, RefreshCw } from 'lucide-react';

export type AnyBadgeStatus =
  | MaterialStatus
  | JobStatus
  | ReviewStatus
  | 'ACTIVE'
  | 'INACTIVE'
  | 'INTEGRATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'PROCESSING'
  | 'QUEUED'
  | 'COMPLETED'
  | 'APPROVED'
  | 'MODIFIED'
  | string;

interface StatusBadgeProps {
  status: AnyBadgeStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'HARMONIZED':
    case 'ACTIVE':
    case 'INTEGRATED':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>
            {status === 'HARMONIZED'
              ? 'Harmonized'
              : status === 'INTEGRATED'
              ? 'Integrated'
              : status === 'COMPLETED'
              ? 'Completed'
              : status === 'APPROVED'
              ? 'Approved'
              : 'Active'}
          </span>
        </span>
      );

    case 'PENDING_REVIEW':
    case 'PENDING':
    case 'QUEUED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>{status === 'PENDING_REVIEW' ? 'Review Required' : status === 'QUEUED' ? 'Queued' : 'Pending'}</span>
        </span>
      );

    case 'MATCHED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>AI Matched</span>
        </span>
      );

    case 'NORMALIZED':
    case 'MODIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 ${sizeClasses}`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span>{status === 'MODIFIED' ? 'Modified' : 'Normalized'}</span>
        </span>
      );

    case 'RAW':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>Raw Ingest</span>
        </span>
      );

    case 'REJECTED':
    case 'FAILED':
    case 'INACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>{status === 'REJECTED' ? 'Rejected' : status === 'FAILED' ? 'Failed' : 'Inactive'}</span>
        </span>
      );

    case 'PROCESSING':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-300 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
          <span>Processing</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-medium rounded bg-slate-100 text-slate-800 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
