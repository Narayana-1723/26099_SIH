import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMaterials } from '../../hooks/useMaterials';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { Material, MaterialStatus } from '../../types/material';
import { CPSE_LIST, MATERIAL_CATEGORIES } from '../../utils/constants';
import { formatDateOnly, truncateText } from '../../utils/formatters';
import { Search, Filter, Eye, Sparkles, UploadCloud, RefreshCw, AlertTriangle } from 'lucide-react';

export const Materials: React.FC = () => {
  const navigate = useNavigate();
  const {
    materials,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
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
      header: 'Material Code',
      sortable: true,
      width: '140px',
      render: (item) => (
        <span className="font-mono font-bold text-gov-navy text-xs">
          {item.materialCode}
        </span>
      ),
    },
    {
      key: 'cpse',
      header: 'CPSE',
      sortable: true,
      width: '100px',
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
          {item.cpse}
        </span>
      ),
    },
    {
      key: 'originalDescription',
      header: 'Description (Original & Normalized)',
      render: (item) => (
        <div className="max-w-md">
          <div className="text-slate-900 font-medium text-xs">
            {truncateText(item.originalDescription, 50)}
          </div>
          <div className="text-[11px] text-slate-500 italic mt-0.5 truncate">
            {truncateText(item.normalizedDescription, 65)}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-700">{item.category}</span>,
    },
    {
      key: 'canonicalCode',
      header: 'Canonical Mapping',
      render: (item) =>
        item.canonicalCode ? (
          <Link
            to={`/user/canonical-materials/${item.canonicalCode}`}
            className="font-mono text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>{item.canonicalCode}</span>
          </Link>
        ) : (
          <span className="text-slate-400 text-xs italic">Unmapped</span>
        ),
    },
    {
      key: 'confidenceScore',
      header: 'AI Confidence',
      sortable: true,
      align: 'center',
      render: (item) =>
        item.confidenceScore ? <ConfidenceBadge score={item.confidenceScore} /> : <span>—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Ingested Date',
      sortable: true,
      render: (item) => <span className="text-slate-500 text-xs">{formatDateOnly(item.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="CPSE Materials Catalog"
        description="Unified registry of ingested CPSE material records with AI normalization and harmonization status"
        breadcrumbs={[{ label: 'Materials Catalog' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="btn-secondary text-xs flex items-center gap-1.5"
              title="Refresh table"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link to="/user/upload" className="btn-primary text-xs flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Materials</span>
            </Link>
          </div>
        }
      />

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={() => void refetch()} className="btn-secondary text-xs">Retry loading catalog</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search code or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          {/* CPSE Filter */}
          <div className="sm:col-span-3">
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

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={params.category || 'ALL'}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              <option value="ALL">All Technical Categories</option>
              {MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={params.status || 'ALL'}
              onChange={(e) => updateFilters({ status: e.target.value as any })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              <option value="ALL">All Statuses</option>
              <option value="HARMONIZED">Harmonized</option>
              <option value="MATCHED">Matched</option>
              <option value="PENDING_REVIEW">Review Req.</option>
              <option value="NORMALIZED">Normalized</option>
              <option value="RAW">Raw Ingest</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </form>
      </div>

      {/* Materials Table */}
      <DataTable
        columns={columns}
        data={materials}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No material records matched your criteria."
        onRowClick={(item) => navigate(`/user/materials/${item.id}`)}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => navigate(`/user/materials/${item.id}`)}
              className="p-1 text-slate-500 hover:text-gov-navy hover:bg-slate-100 rounded"
              title="View material details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <Link
              to={`/user/harmonization?materialId=${item.id}`}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="View AI harmonization matches"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        )}
      />

      {/* Pagination */}
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
