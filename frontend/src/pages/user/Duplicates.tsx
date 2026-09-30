import React, { useEffect, useState } from 'react';
import { useHarmonization } from '../../hooks/useHarmonization';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { DuplicateGroup } from '../../types/harmonization';
import { CopyCheck, ArrowRight, Layers, Check, ExternalLink, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Duplicates: React.FC = () => {
  const { duplicates, isLoading, error, fetchDuplicates } = useHarmonization();
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  if (isLoading) {
    return <LoadingState message="Scanning Duplicate Groups..." subMessage="Cross-referencing attributes across all CPSEs" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Get all unique attribute keys for comparison in modal
  const getAllAttributeKeys = (group: DuplicateGroup): string[] => {
    const keys = new Set<string>();
    group.materials.forEach((m) => {
      Object.keys(m.attributes).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cross-CPSE Duplicate Identification"
        description="AI detection of redundant or identical material codes across multiple enterprise inventories"
        breadcrumbs={[{ label: 'Potential Duplicates' }]}
      />

      <div className="space-y-4">
        {duplicates.map((group) => (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  <CopyCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {group.itemType}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                      {group.materials.length} CPSE Identifiers
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gov-navy mt-0.5">
                    Target: {group.canonicalCandidateName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ConfidenceBadge score={group.confidence} showBar={false} />
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Attributes</span>
                </button>
              </div>
            </div>

            {/* Ingested Items Preview */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {group.materials.map((mat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {mat.cpse}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">{mat.materialCode}</span>
                  </div>
                  <p className="font-mono text-slate-800 text-[11px] leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Modal Dialog */}
      {selectedGroup && (
        <Modal
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          title="Multi-CPSE Attribute Comparison Matrix"
          subtitle={`Redundancy Analysis for ${selectedGroup.canonicalCandidateCode || 'Target Item'}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                AI Confidence Score:{' '}
                <strong className="text-emerald-700 font-mono">{selectedGroup.confidence}%</strong>
              </span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedGroup(null)} className="btn-secondary text-xs">
                  Close Matrix
                </button>
                <Link
                  to={`/user/canonical-materials/${selectedGroup.canonicalCandidateCode}`}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <span>Link to Canonical Master</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="px-4 py-3 font-bold uppercase w-1/4">Technical Attribute</th>
                    {selectedGroup.materials.map((m) => (
                      <th key={m.materialCode} className="px-4 py-3 font-bold uppercase">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-gov-navy text-white text-[10px]">
                            {m.cpse}
                          </span>
                          <span className="font-mono text-[11px] text-slate-800">{m.materialCode}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {/* Full Raw Description Row */}
                  <tr className="bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-600">Raw Description</td>
                    {selectedGroup.materials.map((m) => (
                      <td key={m.materialCode} className="px-4 py-3 font-mono text-[11px]">
                        {m.description}
                      </td>
                    ))}
                  </tr>

                  {/* Attributes Matrix */}
                  {getAllAttributeKeys(selectedGroup).map((attrKey) => {
                    const values = selectedGroup.materials.map((m) => m.attributes[attrKey]);
                    const allMatch = values.every((v) => v && v.toLowerCase() === values[0]?.toLowerCase());

                    return (
                      <tr key={attrKey} className={allMatch ? 'bg-emerald-50/20' : 'hover:bg-slate-50'}>
                        <td className="px-4 py-2.5 font-medium text-slate-700 flex items-center gap-1.5">
                          {allMatch && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{attrKey}</span>
                        </td>
                        {selectedGroup.materials.map((m) => (
                          <td key={m.materialCode} className="px-4 py-2.5 font-mono font-bold">
                            {m.attributes[attrKey] ? (
                              <span className="text-slate-900">{m.attributes[attrKey]}</span>
                            ) : (
                              <span className="text-slate-400 font-normal italic">Not Specified</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2">
              <Layers className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Reconciliation Insight:</strong> These {selectedGroup.materials.length} records represent identical physical items procured under divergent local nomenclature. Merging them under <strong>{selectedGroup.canonicalCandidateCode}</strong> eliminates duplicate inventory and enables joint procurement volume savings.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
