import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { analyticsService } from '../../services/analyticsService';
import { useToast } from '../../context/ToastContext';
import { CPSE_LIST, MATERIAL_CATEGORIES } from '../../utils/constants';
import { FileSpreadsheet, Download, Filter, Calendar, CheckCircle2, FileText } from 'lucide-react';

export const Reports: React.FC = () => {
  const { showToast } = useToast();
  const [selectedCpse, setSelectedCpse] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{ id: string; url: string; time: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await analyticsService.generateReport({
        cpse: selectedCpse !== 'ALL' ? selectedCpse : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        format: selectedFormat,
      });

      setGeneratedReport({
        id: res.reportId,
        url: res.downloadUrl,
        time: new Date().toLocaleTimeString(),
      });
      showToast('success', 'Report Generated', `Report ${res.reportId} ready for export.`);
    } catch (err: any) {
      showToast('error', 'Generation Error', err.message || 'Failed to compile report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Harmonization &amp; Audit Reporting"
        description="Compile and export verifiable material reconciliation summaries and duplicate audit ledgers"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Configuration Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gov-navy" />
            Report Parameters
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target CPSE Scope
              </label>
              <select
                value={selectedCpse}
                onChange={(e) => setSelectedCpse(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
              >
                <option value="ALL">All CPSE Enterprises (Consortium Wide)</option>
                {CPSE_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Category Filter
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
              >
                <option value="ALL">All Categories</option>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Audit Date Horizon
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                >
                  <option value="LAST_7_DAYS">Last 7 Days</option>
                  <option value="LAST_30_DAYS">Last 30 Days (Current Month)</option>
                  <option value="LAST_QUARTER">Current Fiscal Quarter</option>
                  <option value="ALL_TIME">All Historical Records</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Export Document Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('CSV')}
                    className={`py-2 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      selectedFormat === 'CSV'
                        ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV / Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('PDF')}
                    className={`py-2 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      selectedFormat === 'PDF'
                        ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Dossier</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Compiling Dataset...' : 'Compile & Export Report'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Generated Reports */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
            Generated Document Downloads
          </h3>

          {generatedReport && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Report Ready: {generatedReport.id}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Generated at {generatedReport.time} &bull; Scope: {selectedCpse} ({selectedFormat})
              </p>
              <a
                href={generatedReport.url}
                onClick={(e) => {
                  e.preventDefault();
                  showToast('info', 'Download Initiated', `Saving ${generatedReport.id}.${selectedFormat.toLowerCase()}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline pt-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedFormat} Document</span>
              </a>
            </div>
          )}

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Q2-CPSE-Harmonization-Audit.xlsx</div>
                <div className="text-[11px] text-slate-500">14,280 lines &bull; 18 Sep 2026</div>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                Archived
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">ONGC-Mehsana-Asset-Reconciliation.pdf</div>
                <div className="text-[11px] text-slate-500">Executive Summary &bull; 15 Sep 2026</div>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                Archived
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
