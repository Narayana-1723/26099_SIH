import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DEMO_MATERIALS } from '../../data/demoData';
import { Material } from '../../types/material';
import { Sparkles, Eye, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const [filterBand, setFilterBand] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filtered = DEMO_MATERIALS.filter((m) => {
    if (filterBand === 'HIGH') return (m.confidenceScore || 0) >= 85;
    if (filterBand === 'MEDIUM') return (m.confidenceScore || 0) >= 65 && (m.confidenceScore || 0) < 85;
    if (filterBand === 'LOW') return (m.confidenceScore || 0) < 65;
    return true;
  });

  const columns: Column<Material>[] = [
    {
      key: 'materialCode',
      header: 'Source Material Code',
      render: (item) => (
        <span className="font-mono font-bold text-gov-navy text-xs">{item.materialCode}</span>
      ),
    },
    {
      key: 'cpse',
      header: 'CPSE',
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
          {item.cpse}
        </span>
      ),
    },
    {
      key: 'normalizedDescription',
      header: 'Normalized Item Description',
      render: (item) => <span className="text-xs text-slate-800 font-medium">{item.normalizedDescription}</span>,
    },
    {
      key: 'canonicalCode',
      header: 'Matched Canonical Item',
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-700">{item.canonicalCode || 'Candidate Pending'}</span>
          <div className="text-[11px] text-slate-500">{item.canonicalName}</div>
        </div>
      ),
    },
    {
      key: 'confidenceScore',
      header: 'Overall Confidence',
      render: (item) => <ConfidenceBadge score={item.confidenceScore} showBar={true} />,
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Match Results &amp; Confidence Registry"
        description="Comprehensive evaluation of AI semantic match candidates classified across confidence tiers"
        breadcrumbs={[
          { label: 'AI Harmonization', href: '/user/harmonization' },
          { label: 'Match Results' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterBand('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-semibold ${
            filterBand === 'ALL'
              ? 'bg-gov-navy text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Matches ({DEMO_MATERIALS.length})
        </button>
        <button
          onClick={() => setFilterBand('HIGH')}
          className={`px-3 py-1.5 rounded text-xs font-semibold ${
            filterBand === 'HIGH'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          High Confidence &ge;85% ({DEMO_MATERIALS.filter((m) => (m.confidenceScore || 0) >= 85).length})
        </button>
        <button
          onClick={() => setFilterBand('MEDIUM')}
          className={`px-3 py-1.5 rounded text-xs font-semibold ${
            filterBand === 'MEDIUM'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Medium Confidence 65-84% ({DEMO_MATERIALS.filter((m) => (m.confidenceScore || 0) >= 65 && (m.confidenceScore || 0) < 85).length})
        </button>
        <button
          onClick={() => setFilterBand('LOW')}
          className={`px-3 py-1.5 rounded text-xs font-semibold ${
            filterBand === 'LOW'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Low Confidence &lt;65% ({DEMO_MATERIALS.filter((m) => (m.confidenceScore || 0) < 65).length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        emptyMessage="No match candidates in this confidence band."
        renderActions={(item) => (
          <Link
            to={`/user/harmonization?materialId=${item.id}`}
            className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Analyze</span>
          </Link>
        )}
      />
    </div>
  );
};
