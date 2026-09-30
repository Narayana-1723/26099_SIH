import React, { useEffect, useState } from 'react';
import { taxonomyService } from '../../services/taxonomyService';
import { TaxonomyNode } from '../../types/taxonomy';
import { PageHeader } from '../../components/common/PageHeader';
import { TaxonomyTree } from '../../components/taxonomy/TaxonomyTree';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, Edit2, Layers, CheckCircle } from 'lucide-react';

export const AdminTaxonomyManagement: React.FC = () => {
  const { showToast } = useToast();
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnspsc, setNewUnspsc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTaxonomy = async () => {
    const data = await taxonomyService.getTaxonomyTree();
    setNodes(data);
    if (!selectedNode && data.length > 0) {
      setSelectedNode(data[0]);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      showToast('error', 'Validation Error', 'Code and category name are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await taxonomyService.createNode({
        code: newCode,
        name: newName,
        unspscCode: newUnspsc || undefined,
        parentId: selectedNode ? selectedNode.id : null,
      });
      showToast('success', 'Taxonomy Level Created', `Added ${newName} under ${selectedNode?.name || 'Root'}`);
      setCreateModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewUnspsc('');
      loadTaxonomy();
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Taxonomy &amp; Classification Governance"
        description="Establish and maintain standardized UNSPSC category branches and engineering classifications"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Taxonomy Management' }]}
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child Category</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Viewer */}
        <div className="lg:col-span-5 space-y-4">
          <TaxonomyTree
            nodes={nodes}
            selectedNodeId={selectedNode?.id}
            onSelectNode={(n) => setSelectedNode(n)}
          />
        </div>

        {/* Right: Administrative Node Editor */}
        <div className="lg:col-span-7 space-y-4">
          {selectedNode ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-gov-navy" />
                  <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                    Category Parameters ({selectedNode.code})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">Depth Level {selectedNode.depth}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Internal Classification Code
                  </label>
                  <input
                    type="text"
                    value={selectedNode.code}
                    readOnly
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Official Category Title
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedNode.name}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mapped Global UNSPSC Identifier
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedNode.unspscCode || ''}
                    placeholder="e.g. 31161620"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Changes propagate to all connected CPSE AI classification models.
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast('success', 'Taxonomy Updated', 'Node metadata saved.')}
                    className="btn-primary text-xs"
                  >
                    Save Category Updates
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
              Select a node to inspect and modify administrative parameters.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Node */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Taxonomy Classification Node"
        subtitle={`Adding under parent: ${selectedNode?.name || 'Top Level Root'}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateNode} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. MECH-FAST-PIN"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Cotter &amp; Taper Pins"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              UNSPSC Code
            </label>
            <input
              type="text"
              value={newUnspsc}
              onChange={(e) => setNewUnspsc(e.target.value)}
              placeholder="e.g. 31162401"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-gov-navy"
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
              {isSubmitting ? 'Adding...' : 'Add Classification Node'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
