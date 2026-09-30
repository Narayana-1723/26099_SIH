import React from 'react';
import { Material } from '../../types/material';
import { Sparkles, Database, Check } from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface AttributeTableProps {
  material: Material;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({ material }) => {
  return (
    <div className="space-y-6">
      {/* Side-by-side: Original Data vs. AI Normalized Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Original CPSE Data */}
        <div className="bg-slate-50 border border-slate-300 rounded-md p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span>Original Source CPSE Data ({material.cpse})</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Original Material Code:</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {material.materialCode}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Original Description:</span>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-mono mt-0.5 leading-relaxed">
                {material.originalDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: AI-Generated / Normalized Data */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI-Normalized &amp; Standardized Output</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Harmonized Canonical Code:</span>
              <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                {material.canonicalCode || 'Pending Review Assignment'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Normalized Technical Description:</span>
              <div className="bg-white p-2.5 rounded border border-blue-200 text-slate-900 font-medium mt-0.5 leading-relaxed">
                {material.normalizedDescription}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Attributes Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              NER-Extracted Technical Attributes
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {material.extractedAttributes?.length || 0} Attributes Identified
          </span>
        </div>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="px-4 py-2.5">Attribute Name</th>
              <th className="px-4 py-2.5">Extracted Value</th>
              <th className="px-4 py-2.5">Unit</th>
              <th className="px-4 py-2.5 text-right">NER Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {material.extractedAttributes?.map((attr, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-700">{attr.label}</td>
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{attr.value}</td>
                <td className="px-4 py-2.5 text-slate-500">{attr.unit || '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <ConfidenceBadge score={attr.confidence * 100} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
