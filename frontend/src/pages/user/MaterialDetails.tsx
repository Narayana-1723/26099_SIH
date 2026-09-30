import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { materialService } from '../../services/materialService';
import { Material } from '../../types/material';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { AttributeTable } from '../../components/materials/AttributeTable';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';
import {
  Sparkles,
  ArrowLeft,
  Clock,
  History,
  Tag,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const MaterialDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await materialService.getMaterialById(id);
        setMaterial(res);
      } catch (err: any) {
        setError(err.message || 'Material record could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return <LoadingState message="Fetching Material Master Dossier..." subMessage="Querying Spring Boot / PostgreSQL master" />;
  }

  if (error || !material) {
    return <ErrorState message={error || 'Material record not found'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={material.materialCode}
        description={`Originating Enterprise: ${material.cpse} &bull; Technical Category: ${material.category}`}
        breadcrumbs={[
          { label: 'Materials Catalog', href: '/user/materials' },
          { label: material.materialCode },
        ]}
        badge={<StatusBadge status={material.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/user/materials" className="btn-secondary text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </Link>
            <Link
              to={`/user/harmonization?materialId=${material.id}`}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match Recommendations</span>
            </Link>
          </div>
        }
      />

      {/* Meta Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 font-medium block">Originating CPSE:</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{material.cpse}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Taxonomy Path:</span>
          <span className="font-medium text-slate-900 mt-0.5 block">{material.category} / {material.subCategory || 'General'}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Canonical Mapping:</span>
          <div className="mt-0.5">
            {material.canonicalCode ? (
              <Link
                to={`/user/canonical-materials/${material.canonicalCode}`}
                className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>{material.canonicalCode}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-slate-400 italic">None (Unmapped)</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Harmonization Confidence:</span>
          <div className="mt-0.5">
            <ConfidenceBadge score={material.confidenceScore || 0} showBar={true} />
          </div>
        </div>
      </div>

      {/* Main Attributes & AI Normalization Component */}
      <AttributeTable material={material} />

      {/* Audit History Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <History className="w-4 h-4 text-gov-navy" />
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Material Lifecycle &amp; Audit Trail
          </h3>
        </div>

        {material.auditTrail && material.auditTrail.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs">
            {material.auditTrail.map((entry, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-gov-navy border-2 border-white" />
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-mono">{formatDate(entry.timestamp)}</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-slate-800">{entry.action}</span>
                </div>
                <div className="text-slate-700 mt-0.5">
                  <span className="font-medium text-slate-900">{entry.actor}</span>
                  {entry.notes && <span className="text-slate-600 block mt-0.5">{entry.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            No audit log entries recorded for this material.
          </div>
        )}
      </div>
    </div>
  );
};
