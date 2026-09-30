import React from 'react';
import axios from 'axios';
import { PageHeader } from '../../components/common/PageHeader';
import { FileUploader } from '../../components/upload/FileUploader';
import { JobProgressBar } from '../../components/upload/JobProgressBar';
import { useUpload } from '../../hooks/useUpload';
import { useToast } from '../../context/ToastContext';
import { Info, AlertTriangle, FileCode } from 'lucide-react';

export const UploadMaterials: React.FC = () => {
  const { isUploading, job, error, startUpload, retryPolling, resetUpload } = useUpload();
  const { showToast } = useToast();

  const handleUpload = async (file: File, cpse: string) => {
    try {
      const jobId = await startUpload(file, cpse);
      showToast('info', 'Batch Job Created', `Job ${jobId} initialized for ${cpse}. Real-time tracking enabled.`);
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || err.message
        : err.message || 'Error creating ingestion job';
      showToast('error', 'Upload Failed', message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Batch Ingestion"
        description="Upload raw material catalogues from CPSE ERP/SAP systems for AI attribute extraction &amp; canonical mapping"
        breadcrumbs={[{ label: 'Upload Materials' }]}
      />

      {/* Guidance Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Standard Ingestion Protocol</span>
          <p className="text-slate-600">
            Files uploaded to the Spring Boot endpoint are parsed, queued in asynchronous jobs, and processed through
            the Python FastAPI ML service for entity recognition (NER), transformer embeddings, and vector similarity indexing.
          </p>
        </div>
      </div>

      {/* Upload and Job Progress View */}
      {job ? (
        <div className="space-y-6">
          <JobProgressBar job={job} onReset={resetUpload} />
          {error && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</span>
              <button type="button" onClick={retryPolling} className="btn-secondary text-xs">Retry job tracking</button>
            </div>
          )}
        </div>
      ) : (
        <FileUploader onUpload={handleUpload} isUploading={isUploading} />
      )}

      {!job && error && (
        <div role="alert" className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Schema / Format Guidance */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gov-navy" />
          Recommended Ingestion Schema (CSV / JSON)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="px-3 py-2">Column Header</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Mandatory?</th>
                <th className="px-3 py-2">Example Value</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-3 py-2 font-mono font-bold text-gov-navy">MATERIAL_CODE</td>
                <td className="px-3 py-2 font-mono">String</td>
                <td className="px-3 py-2 text-red-600 font-bold">Yes</td>
                <td className="px-3 py-2 font-mono">MAT-ONGC-4091</td>
                <td className="px-3 py-2">Original ERP item identifier</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-bold text-gov-navy">DESCRIPTION</td>
                <td className="px-3 py-2 font-mono">String</td>
                <td className="px-3 py-2 text-red-600 font-bold">Yes</td>
                <td className="px-3 py-2 font-mono">M16 HEX BOLT SS316 X 50MM</td>
                <td className="px-3 py-2">Unstructured raw technical description</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-gov-navy">CATEGORY</td>
                <td className="px-3 py-2 font-mono">String</td>
                <td className="px-3 py-2 text-slate-500">Optional</td>
                <td className="px-3 py-2 font-mono">Mechanical</td>
                <td className="px-3 py-2">Broad classification</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-gov-navy">UNIT_OF_MEASURE</td>
                <td className="px-3 py-2 font-mono">String</td>
                <td className="px-3 py-2 text-slate-500">Optional</td>
                <td className="px-3 py-2 font-mono">NOS / MTR</td>
                <td className="px-3 py-2">Standard procurement unit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
