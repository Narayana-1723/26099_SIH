import React, { useEffect, useState } from 'react';
import { canonicalService } from '../../services/canonicalService';
import { CanonicalMaterial } from '../../types/canonical';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { MATERIAL_CATEGORIES } from '../../utils/constants';
import { formatDateOnly, truncateText } from '../../utils/formatters';
import { FileCheck2, Plus, Search, Edit3, Trash2, Layers } from 'lucide-react';

export const AdminCanonicalManagement: React.FC = () => {
  const { showToast } = useToast();
  const [canonicals, setCanonicals] = useState<CanonicalMaterial[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState('Mechanical');
  const [formUnspsc, setFormUnspsc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await canonicalService.getCanonicalMaterials();
      setCanonicals(data);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('error', 'Validation Error', 'Standard material name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await canonicalService.createCanonical({
        canonicalCode: formCode.trim(),
        standardName: formName,
        description: formDesc,
        category: formCat,
        categoryPath: [formCat],
        unspscCode: formUnspsc,
        standardAttributes: {},
      });
      showToast('success', 'Canonical Item Created', 'New unified master code assigned.');
      setCreateModalOpen(false);
      setFormName('');
      setFormCode('');
      setFormDesc('');
      setFormUnspsc('');
      loadData();
    } catch (err: any) {
      showToast('error', 'Creation Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<CanonicalMaterial>[] = [
    {
      key: 'canonicalCode',
      header: 'Canonical Code',
      sortable: true,
      render: (c) => <span className="font-mono font-bold text-emerald-700 text-xs">{c.canonicalCode}</span>,
    },
    {
      key: 'standardName',
      header: 'Standard Title & Description',
      sortable: true,
      render: (c) => (
        <div className="max-w-md text-xs">
          <div className="font-bold text-slate-900">{c.standardName}</div>
          <div className="text-slate-500 line-clamp-1">{truncateText(c.description, 60)}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (c) => <span className="text-xs text-slate-700">{c.category}</span>,
    },
    {
      key: 'sourceMaterials',
      header: 'Associated Source Mappings',
      align: 'center',
      render: (c) => (
        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-gov-navy">
          {c.sourceMaterials?.length || 0} Materials
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Master Status',
      render: (c) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {c.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creation Date',
      render: (c) => <span className="text-xs text-slate-500">{formatDateOnly(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Canonical Material Master Management"
        description="Establish authoritative item definitions, review equivalencies, and maintain unified catalogue records"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Canonical Management' }]}
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Canonical Master</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={canonicals}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No canonical materials found."
      />

      {/* Modal: Create Canonical Item */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Establish New Canonical Material Master"
        subtitle="Single Source of Truth identifier for cross-CPSE procurement"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Canonical Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="e.g. CM-000124"
              required
              maxLength={100}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:ring-1 focus:ring-gov-navy"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Standardized Technical Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Stainless Steel 316 Hex Bolt M16 × 50 mm"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technical Category
              </label>
              <select
                value={formCat}
                onChange={(e) => setFormCat(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-gov-navy"
              >
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                UNSPSC Code
              </label>
              <input
                type="text"
                value={formUnspsc}
                onChange={(e) => setFormUnspsc(e.target.value)}
                placeholder="e.g. 31161620"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-gov-navy"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Technical Specification Scope
            </label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
              placeholder="Detailed technical definition, standards compliance (ISO/DIN/ASTM), and functional scope..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting ? 'Creating...' : 'Save Canonical Master'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
