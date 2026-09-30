import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHarmonization } from '../../hooks/useHarmonization';
import { PageHeader } from '../../components/common/PageHeader';
import { ExplainableAiCard } from '../../components/harmonization/ExplainableAiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Sparkles,
  ArrowRight,
  Database,
  FileCheck2,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const Harmonization: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedMaterialId = searchParams.get('materialId');
  const {
    result,
    isLoading,
    error,
    materials,
    isMaterialsLoading,
    materialsError,
    fetchMaterials,
    fetchMatches,
  } = useHarmonization();
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);
  const selectedMaterial = materials.find((material) => material.id === requestedMaterialId) || materials[0];

  useEffect(() => {
    void fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    if (!selectedMaterial) return;
    if (requestedMaterialId !== selectedMaterial.id) {
      setSearchParams({ materialId: selectedMaterial.id }, { replace: true });
    }
    void fetchMatches(selectedMaterial);
  }, [selectedMaterial, requestedMaterialId, fetchMatches, setSearchParams]);

  const handleSelectMaterial = (id: string) => {
    setSearchParams({ materialId: id });
    setSelectedCandidateIdx(0);
  };

  if (isMaterialsLoading || (selectedMaterial && isLoading)) {
    return <LoadingState message={isMaterialsLoading ? 'Loading materials...' : 'Executing Semantic Match Inference...'} subMessage={isMaterialsLoading ? 'Retrieving materials from the catalog' : 'Calculating vector similarity and engineering attributes'} />;
  }

  if (materialsError) {
    return <ErrorState message={materialsError} onRetry={() => void fetchMaterials()} />;
  }

  if (!materials.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">No materials available for matching</h2>
        <p className="mt-2 text-sm text-slate-600">Add or upload a material, then return here to run harmonization.</p>
        <button onClick={() => navigate('/user/upload')} className="btn-primary mt-4">Upload Materials</button>
      </div>
    );
  }

  if (error || !result) {
    return <ErrorState message={error || 'Harmonization result could not be retrieved.'} onRetry={() => selectedMaterial && void fetchMatches(selectedMaterial)} />;
  }

  const currentCandidate = result.candidates[selectedCandidateIdx] || result.topMatch;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Harmonization &amp; Canonical Matcher"
        description="Transformer-based vector matching against unified CPSE canonical material catalog"
        breadcrumbs={[{ label: 'AI Harmonization' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/user/review-queue')}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Go to Review Queue</span>
            </button>
          </div>
        }
      />

      {/* Top Selector: Pick a Material to harmonise */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Ingested Material for Similarity Analysis
        </label>
        <div className="flex flex-wrap gap-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelectMaterial(m.id)}
              className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-2 border ${
                m.id === selectedMaterial?.id
                  ? 'bg-gov-navy text-white border-gov-navy font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-mono">{m.materialCode}</span>
              <span className="text-[10px] opacity-75">({m.cpse})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ingested Source Material Dossier */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gov-navy" />
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              Source Material ({result.material.cpse})
            </h3>
          </div>
          <StatusBadge status={result.material.status} size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Original Description:</span>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-900 font-mono font-bold mt-1">
              {result.material.originalDescription}
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">AI Normalized Description:</span>
            <div className="bg-blue-50/50 p-2.5 rounded border border-blue-200 text-blue-950 font-medium mt-1">
              {result.material.normalizedDescription}
            </div>
          </div>
        </div>

        {/* Extracted Attributes Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Extracted Technical Attributes
          </span>
          <div className="flex flex-wrap gap-2">
            {(result.material.extractedAttributes.length > 0
              ? result.material.extractedAttributes
              : Object.entries(result.material.attributes).map(([key, value]) => ({ key, label: key, value, confidence: 0 }))
            ).map((attr, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs flex items-center gap-1.5"
              >
                <span className="text-slate-500 font-medium">{attr.label}:</span>
                <span className="font-mono font-bold text-slate-900">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates Selection Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Top AI Recommended Canonical Matches ({result.candidates.length})
          </h3>
          <span className="text-[11px] text-slate-500">Sorted by Multi-Signal Score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.candidates.map((cand, idx) => (
            <div
              key={cand.canonicalMaterial.id}
              onClick={() => setSelectedCandidateIdx(idx)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCandidateIdx === idx
                  ? 'border-gov-navy bg-blue-50/30 ring-2 ring-gov-navy/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-gov-navy border border-slate-300">
                    {cand.canonicalMaterial.canonicalCode}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      TOP RECOMMENDED
                    </span>
                  )}
                </div>
                <ConfidenceBadge score={cand.scores.finalConfidence} />
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {cand.canonicalMaterial.standardName}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {cand.canonicalMaterial.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Semantic: <strong className="text-slate-800 font-mono">{cand.scores.semanticScore}%</strong> &bull;
                  Attribute: <strong className="text-slate-800 font-mono">{cand.scores.attributeScore}%</strong>
                </span>
                <span className="text-blue-700 font-semibold flex items-center">
                  <span>View Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Match Explainable AI Component */}
      {currentCandidate && (
        <div className="space-y-4">
          <ExplainableAiCard
            scores={currentCandidate.scores}
            explanation={currentCandidate.explanation}
            title={`Explainable Match Analysis for ${currentCandidate.canonicalMaterial.canonicalCode}`}
          />

          {/* Action Row */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Proceed to Formal Harmonization?
              </span>
              <span className="text-xs text-slate-500">
                Matches with confidence &ge; 85% can be reconciled or pushed to Human Review Queue.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/user/review-queue?id=rev-1`)}
                className="btn-secondary text-xs"
              >
                Send to Review Queue
              </button>
              <button
                onClick={() => navigate(`/user/canonical-materials/${currentCandidate.canonicalMaterial.canonicalCode}`)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Inspect Canonical Master</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
