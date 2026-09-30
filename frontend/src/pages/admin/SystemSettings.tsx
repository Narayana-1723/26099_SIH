import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';
import { Settings, Sliders, Database, Key, Save, RefreshCw } from 'lucide-react';

export const AdminSystemSettings: React.FC = () => {
  const { showToast } = useToast();

  const [autoApproveThreshold, setAutoApproveThreshold] = useState(85);
  const [reviewThreshold, setReviewThreshold] = useState(65);
  const [vectorBatchSize, setVectorBatchSize] = useState(500);
  const [enableAutoHarmonize, setEnableAutoHarmonize] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('success', 'Configuration Saved', 'Harmonization confidence rules propagated across CPSE nodes.');
    }, 400);
  };

  const handleReindex = () => {
    showToast('info', 'Vector Re-Index Triggered', 'Background job queued in FastAPI microservice.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Configuration &amp; Governance Rules"
        description="Configure automated harmonization confidence thresholds, index rebuilding, and API integrations"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'System Settings' }]}
      />

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Confidence Thresholds */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-gov-navy" />
            <h3 className="font-bold text-gov-navy uppercase tracking-wider">
              AI Decision &amp; Confidence Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Auto-Approval Threshold ({autoApproveThreshold}%)
              </label>
              <p className="text-slate-500 mb-2">
                Matches with confidence score above this percentage are harmonized automatically.
              </p>
              <input
                type="range"
                min={70}
                max={99}
                value={autoApproveThreshold}
                onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
                className="w-full accent-gov-navy cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>70% (Aggressive)</span>
                <span className="font-bold text-emerald-700">{autoApproveThreshold}%</span>
                <span>99% (Strict)</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Human Review Queue Cutoff ({reviewThreshold}%)
              </label>
              <p className="text-slate-500 mb-2">
                Matches falling between {reviewThreshold}% and {autoApproveThreshold}% are routed to human review.
              </p>
              <input
                type="range"
                min={40}
                max={75}
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(Number(e.target.value))}
                className="w-full accent-gov-navy cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>40%</span>
                <span className="font-bold text-amber-700">{reviewThreshold}%</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoHarmonize"
              checked={enableAutoHarmonize}
              onChange={(e) => setEnableAutoHarmonize(e.target.checked)}
              className="rounded text-gov-navy focus:ring-gov-navy"
            />
            <label htmlFor="autoHarmonize" className="font-medium text-slate-800 cursor-pointer">
              Enable continuous background reconciliation for newly ingested material batches
            </label>
          </div>
        </div>

        {/* Vector DB Index Operations */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-gov-navy" />
            <h3 className="font-bold text-gov-navy uppercase tracking-wider">
              Vector Database Operations
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">Force Vector Space Re-Indexing</div>
              <p className="text-slate-500 mt-0.5">
                Recomputes dense HNSW embeddings across all 5,240 canonical master materials.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReindex}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rebuild Index Now</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary px-6 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
