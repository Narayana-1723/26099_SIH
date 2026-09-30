import React, { useState } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { Material } from '../../types/material';
import { CPSE_LIST, MATERIAL_CATEGORIES } from '../../utils/constants';
import { formatDateOnly, truncateText } from '../../utils/formatters';
import { Search, ShieldAlert, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

export const AdminMaterials: React.FC = () => {
  const { showToast } = useToast();
  const {
    materials,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    params,
    setPage,
    updateFilters,
    refetch,
  } = useMaterials({ page: 1, pageSize: 10 });

  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const columns: Column<Material>[] = [
    {
      key: 'materialCode',
      header: 'CPSE Material Code',
      sortable: true,
      render: (m) => <span className="font-mono font-bold text-gov-navy text-xs">{m.materialCode}</span>,
    },
    {
      key: 'cpse',
      header: 'Origin CPSE',
      sortable: true,
      render: (m) => (
        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-300">
          {m.cpse}
        </span>
      ),
    },
    {
      key: 'originalDescription',
      header: 'Raw vs. Normalized Description',
      render: (m) => (
        <div className="max-w-md text-xs">
          <div className="font-medium text-slate-900">{truncateText(m.originalDescription, 45)}</div>
          <div className="text-[11px] text-slate-500 italic mt-0.5">{truncateText(m.normalizedDescription, 55)}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (m) => <span className="text-xs text-slate-700">{m.category}</span>,
    },
    {
      key: 'canonicalCode',
      header: 'Canonical Code',
      render: (m) =>
        m.canonicalCode ? (
          <span className="font-mono text-xs font-bold text-emerald-700">{m.canonicalCode}</span>
        ) : (
          <span className="text-slate-400 text-xs italic">Unmapped</span>
        ),
    },
    {
      key: 'confidenceScore',
      header: 'Confidence',
      align: 'center',
      render: (m) => (m.confidenceScore ? <ConfidenceBadge score={m.confidenceScore} /> : <span>—</span>),
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (m) => <StatusBadge status={m.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Ingested',
      render: (m) => <span className="text-slate-500 text-xs">{formatDateOnly(m.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consortium Global Material Registry"
        description="Administrative supervision, bulk override, and audit inspection across all connected CPSE instances"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Material Management' }]}
        badge={
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
            Privileged Master Mode
          </span>
        }
        actions={
          <button onClick={() => refetch()} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search material code or technical terms..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </form>

        <div className="sm:col-span-4">
          <select
            value={params.cpse || 'ALL'}
            onChange={(e) => updateFilters({ cpse: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All CPSE Enterprises</option>
            {CPSE_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={params.status || 'ALL'}
            onChange={(e) => updateFilters({ status: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All Statuses</option>
            <option value="HARMONIZED">Harmonized</option>
            <option value="MATCHED">Matched</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="NORMALIZED">Normalized</option>
            <option value="RAW">Raw</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No material records found in administrative query."
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              to={`/user/materials/${item.id}`}
              className="btn-secondary text-xs py-0.5 px-2 text-gov-navy"
            >
              Inspect
            </Link>
          </div>
        )}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalRecords={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(sz) => updateFilters({ pageSize: sz })}
      />
    </div>
  );
};
