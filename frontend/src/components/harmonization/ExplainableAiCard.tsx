import React from 'react';
import { ScoreBreakdown, MatchExplanation } from '../../types/harmonization';
import { Check, X, ShieldAlert, Cpu, Award } from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface ExplainableAiCardProps {
  scores: ScoreBreakdown;
  explanation: MatchExplanation;
  title?: string;
}

export const ExplainableAiCard: React.FC<ExplainableAiCardProps> = ({
  scores,
  explanation,
  title = 'Explainable AI — Match Justification',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-gov-navy" />
          <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Final Confidence:</span>
          <ConfidenceBadge score={scores.finalConfidence} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Score Meters Breakdown */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Multi-Signal Score Breakdown
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span>Semantic Embeddings</span>
                <span className="font-bold text-slate-900 font-mono">{scores.semanticScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${scores.semanticScore}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span>Attribute Matching</span>
                <span className="font-bold text-slate-900 font-mono">{scores.attributeScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${scores.attributeScore}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span>Lexical (BM25)</span>
                <span className="font-bold text-slate-900 font-mono">{scores.lexicalScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full" style={{ width: `${scores.lexicalScore}%` }} />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-900 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Combined Rating
                </span>
                <span className="font-bold text-emerald-800 font-mono">{scores.finalConfidence}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-700 h-full" style={{ width: `${scores.finalConfidence}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Matched vs Unmatched Attributes Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Matched Attributes */}
          <div className="border border-slate-200 rounded p-3.5 bg-emerald-50/20">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Verified Matching Attributes ({explanation.matchedAttributes.length})
            </span>
            <div className="space-y-1.5">
              {explanation.matchedAttributes.map((attr, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-medium text-slate-700">{attr.key}:</span>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-slate-900 font-bold">{attr.sourceValue}</span>
                    <span className="text-emerald-600 font-bold">&cong;</span>
                    <span className="text-emerald-800 font-bold">{attr.targetValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unmatched / Discrepancy Attributes */}
          <div className="border border-slate-200 rounded p-3.5 bg-amber-50/20">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Attribute Variances / Gaps ({explanation.unmatchedAttributes.length})
            </span>
            {explanation.unmatchedAttributes.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-white rounded border border-slate-200">
                No attribute discrepancies found. Perfect dimensional alignment.
              </div>
            ) : (
              <div className="space-y-1.5">
                {explanation.unmatchedAttributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-amber-200">
                    <span className="font-medium text-amber-900">{attr.key}:</span>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-red-700">
                      <span>{attr.sourceValue || 'Missing'}</span>
                      <X className="w-3 h-3 text-red-500" />
                      <span>{attr.targetValue || 'Missing'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Applied Domain Rules */}
        {explanation.appliedRules && explanation.appliedRules.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Applied Enterprise Domain &amp; Standardization Rules
            </span>
            <ul className="space-y-1 list-disc list-inside text-slate-700">
              {explanation.appliedRules.map((rule, idx) => (
                <li key={idx} className="text-slate-800 font-medium">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {explanation.notes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
            <strong>Auditor Note:</strong> {explanation.notes}
          </div>
        )}
      </div>
    </div>
  );
};
