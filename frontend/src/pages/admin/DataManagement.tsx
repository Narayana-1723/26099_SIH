import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProcessingJob } from '../../types/job';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Database, RotateCw, Trash2, CheckCircle2, AlertOctagon, FileSpreadsheet } from 'lucide-react';

const DEMO_ADMIN_JOBS: ProcessingJob[] = [
  {
    jobId: 'JOB-98421',
    fileName: 'ONGC_Mehsana_Mechanical_Batch_04.csv',
    cpse: 'ONGC',
    totalRecords: 4850,
    processedRecords: 4850,
    failedRecords: 12,
    harmonizedRecords: 4230,
    status: 'COMPLETED',
    progressPercent: 100,
    currentStep: 'DONE',
    startedAt: '2026-09-18T10:15:00Z',
    completedAt: '2026-09-18T10:18:24Z',
  },
  {
    jobId: 'JOB-98420',
    fileName: 'BHEL_Trichy_Pipes_Valves_2026.xlsx',
    cpse: 'BHEL',
    totalRecords: 6200,
    processedRecords: 6200,
    failedRecords: 28,
    harmonizedRecords: 5410,
    status: 'COMPLETED',
    progressPercent: 100,
    currentStep: 'DONE',
    startedAt: '2026-09-17T15:30:00Z',
    completedAt: '2026-09-17T15:35:10Z',
  },
  {
    jobId: 'JOB-98419',
    fileName: 'NTPC_Vindhyachal_Electrical_Mtr.json',
    cpse: 'NTPC',
    totalRecords: 3100,
    processedRecords: 1850,
    failedRecords: 4,
    harmonizedRecords: 1420,
    status: 'PROCESSING',
    progressPercent: 60,
    currentStep: 'SEMANTIC_MATCHING',
    startedAt: '2026-09-18T11:00:00Z',
  },
  {
    jobId: 'JOB-98418',
    fileName: 'SAIL_Bhilai_Fasteners_InvalidHeaders.csv',
    cpse: 'SAIL',
    totalRecords: 1500,
    processedRecords: 0,
    failedRecords: 1500,
    harmonizedRecords: 0,
    status: 'FAILED',
    progressPercent: 0,
    currentStep: 'VALIDATING',
    startedAt: '2026-09-16T09:20:00Z',
    errorMessage: 'Header parsing error: Missing mandatory column MATERIAL_CODE',
  },
];

export const AdminDataManagement: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<ProcessingJob[]>(DEMO_ADMIN_JOBS);

  const handleRetryJob = (jobId: string) => {
    showToast('info', 'Job Requeued', `Re-running ingestion pipeline for ${jobId}`);
    setJobs((prev) =>
      prev.map((j) =>
        j.jobId === jobId
          ? { ...j, status: 'PROCESSING', progressPercent: 15, currentStep: 'VALIDATING' }
          : j
      )
    );
  };

  const handlePurgeLogs = () => {
    showToast('success', 'Cache Cleared', 'Temporary batch staging tables and logs purged.');
  };

  const columns: Column<ProcessingJob>[] = [
    {
      key: 'jobId',
      header: 'Job Identifier',
      render: (j) => <span className="font-mono font-bold text-gov-navy text-xs">{j.jobId}</span>,
    },
    {
      key: 'fileName',
      header: 'Ingested Dataset File',
      render: (j) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>{j.fileName}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Started: {formatDate(j.startedAt ?? undefined)}</div>
        </div>
      ),
    },
    {
      key: 'cpse',
      header: 'CPSE Node',
      render: (j) => (
        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-300">
          {j.cpse}
        </span>
      ),
    },
    {
      key: 'totalRecords',
      header: 'Records Stats',
      render: (j) => (
        <div className="text-xs">
          <div>Total: <span className="font-mono font-bold text-slate-900">{j.totalRecords?.toLocaleString() ?? '—'}</span></div>
          <div className="text-[11px] text-emerald-700">Harmonized: {j.harmonizedRecords?.toLocaleString() ?? '—'}</div>
          {(j.failedRecords ?? 0) > 0 && (
            <div className="text-[11px] text-red-600 font-semibold">Errors: {j.failedRecords?.toLocaleString()}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Pipeline Status',
      render: (j) => (
        <div>
          <StatusBadge status={j.status} size="sm" />
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{j.currentStep || '—'}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Ingestion &amp; Pipeline Management"
        description="Monitor asynchronous ETL jobs, re-run failed batch conversions, and manage staging storage"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Data Management' }]}
        actions={
          <button onClick={handlePurgeLogs} className="btn-secondary text-xs flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Purge Staging Logs</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Total Ingestion Jobs</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">142</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Success Rate</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">97.8%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Records Staged</span>
          <span className="text-xl font-bold font-mono text-gov-navy mt-1 block">913,500</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Active Asynchronous Tasks</span>
          <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">1 Active</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        keyField="jobId"
        emptyMessage="No historical ingestion jobs found."
        renderActions={(j) => (
          <div className="flex items-center justify-end gap-2">
            {j.status === 'FAILED' ? (
              <button
                onClick={() => handleRetryJob(j.jobId)}
                className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-Process</span>
              </button>
            ) : (
              <button
                onClick={() => showToast('info', 'Job Log Inspect', `Telemetry loaded for ${j.jobId}`)}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                Inspect Logs
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
};
