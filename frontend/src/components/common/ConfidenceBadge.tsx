import React from 'react';
import { CONFIDENCE_THRESHOLDS } from '../../utils/constants';

interface ConfidenceBadgeProps {
  score?: number; // 0 - 100
  showBar?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score = 0, showBar = false }) => {
  const rounded = Math.round(score);

  let colorClasses = 'bg-red-50 text-red-700 border-red-200';
  let barColor = 'bg-red-600';
  let label = 'Low';

  if (rounded >= CONFIDENCE_THRESHOLDS.HIGH) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    barColor = 'bg-emerald-600';
    label = 'High';
  } else if (rounded >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    barColor = 'bg-amber-500';
    label = 'Medium';
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${colorClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rounded >= 85 ? '#059669' : rounded >= 65 ? '#d97706' : '#dc2626' }} />
        <span>{rounded}%</span>
        <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">({label})</span>
      </div>
      {showBar && (
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${rounded}%` }} />
        </div>
      )}
    </div>
  );
};
