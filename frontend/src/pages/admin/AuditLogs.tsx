import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { AuditLogItem } from '../../types/analytics';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, Search, Filter, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        user: searchUser || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
      });
      setLogs(data);
    } catch {
      // handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchUser, actionFilter]);

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp (IST)',
      sortable: true,
      width: '180px',
      render: (l) => <span className="font-mono text-xs text-slate-700">{formatDate(l.timestamp)}</span>,
    },
    {
      key: 'user',
      header: 'Actor & Identity',
      sortable: true,
      render: (l) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{l.user}</div>
          <div className="font-mono text-[10px] text-slate-500">{l.employeeId} &bull; {l.role}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Executed',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-bold text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          {l.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Target Entity',
      render: (l) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{l.entity}</span>
          <span className="ml-1 text-[11px] text-slate-500 font-mono">({l.entityId})</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Transaction Details',
      render: (l) => <span className="text-xs text-slate-600 line-clamp-1">{l.details || '—'}</span>,
    },
    {
      key: 'result',
      header: 'Result',
      align: 'center',
      render: (l) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
            l.result === 'SUCCESS'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {l.result === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{l.result}</span>
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Gateway IP',
      render: (l) => <span className="font-mono text-xs text-slate-500">{l.ipAddress || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tamper-Evident Security &amp; Transaction Audit Log"
        description="Immutable ledger tracking all administrative modifications, batch uploads, and review approvals"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Audit Logs' }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            <Lock className="w-3 h-3 text-slate-600" />
            Append-Only Audit Store
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            placeholder="Search by actor name or employee ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All Action Events</option>
            <option value="REVIEW_APPROVE">REVIEW_APPROVE</option>
            <option value="BATCH_DATA_UPLOAD">BATCH_DATA_UPLOAD</option>
            <option value="TAXONOMY_NODE_CREATE">TAXONOMY_NODE_CREATE</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="VECTOR_INDEX_REBUILD">VECTOR_INDEX_REBUILD</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No audit logs matched search criteria."
      />
    </div>
  );
};
