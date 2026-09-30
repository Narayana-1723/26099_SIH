import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { canonicalService } from '../../services/canonicalService';
import { CanonicalMaterial } from '../../types/canonical';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDateOnly, truncateText } from '../../utils/formatters';
import { MATERIAL_CATEGORIES } from '../../utils/constants';
import {
  FileCheck2,
  Search,
  Eye,
  ExternalLink,
  Layers,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const CanonicalMaterials: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<CanonicalMaterial[]>([]);
  const [selectedItem, setSelectedItem] = useState<CanonicalMaterial | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'ALL'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCanonicals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await canonicalService.getCanonicalMaterials(
          searchInput,
          selectedCategory !== 'ALL' ? selectedCategory : undefined
        );
        setMaterials(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load canonical materials master');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanonicals();
  }, [searchInput, selectedCategory]);

  const columns: Column<CanonicalMaterial>[] = [
    {
      key: 'canonicalCode',
      header: 'Canonical Code',
      sortable: true,
      width: '140px',
      render: (item) => (
        <span className="font-mono font-bold text-emerald-700 text-xs">
          {item.canonicalCode}
        </span>
      ),
    },
    {
      key: 'standardName',
      header: 'Standard Technical Name',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{item.standardName}</div>
          <div className="text-[11px] text-slate-500 line-clamp-1">{truncateText(item.description, 60)}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Taxonomy Category',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-700">{item.category}</span>,
    },
    {
      key: 'sourceMaterials',
      header: 'Harmonized CPSE Equivalencies',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {item.sourceMaterials?.length || 0} CPSEs Mapped
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Master Status',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Established Date',
      render: (item) => <span className="text-xs text-slate-500">{formatDateOnly(item.createdAt)}</span>,
    },
  ];

  if (isLoading && materials.length === 0) {
    return <LoadingState message="Querying Canonical Material Master..." subMessage="Fetching authoritative CPSE standard records" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unified Canonical Material Master"
        description="Authoritative standardized master registry serving as the single source of truth across all CPSEs"
        breadcrumbs={[{ label: 'Canonical Materials' }]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search standard title, canonical code, or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="sm:col-span-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All Categories</option>
            {MATERIAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {/* Canonical Table */}
      <DataTable
        columns={columns}
        data={materials}
        keyField="id"
        emptyMessage="No canonical materials found matching query."
        onRowClick={(item) => setSelectedItem(item)}
        renderActions={(item) => (
          <button
            onClick={() => setSelectedItem(item)}
            className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
        )}
      />

      {/* Canonical Material Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Canonical Dossier: ${selectedItem.canonicalCode}`}
          subtitle={selectedItem.standardName}
          maxWidth="2xl"
          footer={
            <button onClick={() => setSelectedItem(null)} className="btn-secondary text-xs">
              Close Dossier
            </button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Standard Description & Path */}
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Category Hierarchy:</span>
                <span className="font-semibold text-slate-800">
                  {selectedItem.categoryPath?.join(' → ') || selectedItem.category}
                </span>
              </div>
              {selectedItem.unspscCode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">UNSPSC Code:</span>
                  <span className="font-mono font-bold text-gov-navy">{selectedItem.unspscCode}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">Standard Scope Description:</span>
                <p className="text-slate-800 leading-relaxed font-normal">{selectedItem.description}</p>
              </div>
            </div>

            {/* Standardized Attributes Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Standardized Engineering Attributes
              </h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(selectedItem.standardAttributes || {}).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-600 bg-slate-50/70 w-1/3">{key}</td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cross-CPSE Equivalencies List */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Unified Enterprise Material Equivalencies ({selectedItem.sourceMaterials?.length || 0})</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Live Mappings</span>
              </h4>

              {selectedItem.sourceMaterials && selectedItem.sourceMaterials.length > 0 ? (
                <div className="space-y-2">
                  {selectedItem.sourceMaterials.map((src, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold bg-gov-navy text-white text-[10px]">
                            {src.cpse}
                          </span>
                          <span className="font-mono font-bold text-slate-900">{src.materialCode}</span>
                        </div>
                        <div className="font-mono text-slate-700 text-[11px] mt-1">
                          {src.originalDescription}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 flex-shrink-0">
                        <div>Approved by {src.mappedBy}</div>
                        <div>{formatDateOnly(src.mappedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded border border-slate-200 text-slate-500 italic text-center">
                  No source materials mapped to this canonical entry yet.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
