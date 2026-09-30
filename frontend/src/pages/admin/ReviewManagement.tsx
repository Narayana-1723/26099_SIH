import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DEMO_REVIEW_ITEMS, DEMO_USERS } from '../../data/demoData';
import { ReviewItem } from '../../types/review';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Sliders, Clock, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminReviewManagement: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<ReviewItem[]>(DEMO_REVIEW_ITEMS);

  const handleAssignReviewer = (itemId: string, reviewerName: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, assignedReviewer: reviewerName } : it))
    );
    showToast('success', 'Reviewer Assigned', `Task routed to ${reviewerName}`);
  };

  const columns: Column<ReviewItem>[] = [
    {
      key: 'materialCode',
      header: 'Pending Item',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-xs">{r.material.materialCode}</span>
          <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
            {r.material.cpse}
          </span>
          <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
            {r.material.originalDescription}
          </div>
        </div>
      ),
    },
    {
      key: 'suggestedCanonical',
      header: 'Candidate Standard',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-700">
            {r.suggestedCanonical.canonicalCode}
          </span>
          <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
            {r.suggestedCanonical.standardName}
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Review Priority / SLA',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            r.priority === 'HIGH'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : r.priority === 'MEDIUM'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {r.priority} SLA (24h)
        </span>
      ),
    },
    {
      key: 'assignedReviewer',
      header: 'Assigned Auditor',
      render: (r) => (
        <select
          value={r.assignedReviewer || 'Unassigned'}
          onChange={(e) => handleAssignReviewer(r.id, e.target.value)}
          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-gov-navy"
        >
          <option value="Unassigned">Unassigned (Pool)</option>
          <option value="Vikramaditya Sen">Vikramaditya Sen (NTPC)</option>
          <option value="Dr. Ananya Iyer">Dr. Ananya Iyer (Admin)</option>
          <option value="Rajesh Sharma">Rajesh Sharma (ONGC)</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Queued Timestamp',
      render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Review Workload &amp; SLA Governance"
        description="Monitor audit throughput, assign dispute items to domain auditors, and track reconciliation SLAs"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Review Management' }]}
      />

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Total In Queue</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {items.length} Tasks
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">High Priority Expedites</span>
          <span className="text-xl font-bold font-mono text-red-700 mt-1 block">
            {items.filter((i) => i.priority === 'HIGH').length} Critical
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Average Resolution Time</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
            4.2 Hours
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        keyField="id"
        emptyMessage="No pending review items."
      />
    </div>
  );
};
