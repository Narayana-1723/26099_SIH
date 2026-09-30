import React, { useEffect, useState } from 'react';
import { taxonomyService } from '../../services/taxonomyService';
import { TaxonomyNode } from '../../types/taxonomy';
import { PageHeader } from '../../components/common/PageHeader';
import { TaxonomyTree } from '../../components/taxonomy/TaxonomyTree';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { FolderTree, Search, Layers, Box, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Taxonomy: React.FC = () => {
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaxonomy = async () => {
      setIsLoading(true);
      try {
        const data = await taxonomyService.getTaxonomyTree();
        setNodes(data);
        if (data.length > 0) {
          setSelectedNode(data[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load taxonomy tree');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaxonomy();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Unified CPSE Taxonomy Tree..." subMessage="Fetching hierarchical UNSPSC taxonomy mapping" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified CPSE Material Taxonomy"
        description="Hierarchical category taxonomy harmonized across Indian Public Sector Enterprises"
        breadcrumbs={[{ label: 'Taxonomy Browser' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree View */}
        <div className="lg:col-span-5 space-y-4">
          <TaxonomyTree
            nodes={nodes}
            selectedNodeId={selectedNode?.id}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Right Column: Node Details & Mapped Materials */}
        <div className="lg:col-span-7 space-y-4">
          {selectedNode ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gov-navy bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                      {selectedNode.code}
                    </span>
                    {selectedNode.unspscCode && (
                      <span className="text-xs text-slate-500 font-mono">
                        UNSPSC: <strong>{selectedNode.unspscCode}</strong>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedNode.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Canonical Items</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">
                    {selectedNode.canonicalCount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Hierarchy Depth</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    Level {selectedNode.depth} {selectedNode.depth === 0 ? '(Root Sector)' : selectedNode.depth === 1 ? '(Group)' : '(Family / Class)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Mapped CPSE Materials</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {selectedNode.materialsCount.toLocaleString()} Records
                  </span>
                </div>
              </div>

              {/* Subcategories preview */}
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sub-Categories ({selectedNode.children.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNode.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedNode(child)}
                        className="p-2.5 rounded border border-slate-200 hover:border-gov-navy bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer text-xs transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{child.name}</div>
                          <div className="font-mono text-[10px] text-slate-500">{child.code}</div>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-700 font-bold">
                          {child.canonicalCount} CM
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Link to Filter Materials */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/user/canonical-materials?category=${selectedNode.name}`}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <span>Explore Canonical Materials in this Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500">
              Select a taxonomy node from the hierarchy tree to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
