import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'navy' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'navy',
}) => {
  const borderColors = {
    navy: 'border-l-gov-navy',
    emerald: 'border-l-emerald-600',
    amber: 'border-l-amber-500',
    blue: 'border-l-blue-600',
    purple: 'border-l-purple-600',
  }[highlightColor];

  const iconColors = {
    navy: 'text-gov-navy bg-slate-100',
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    blue: 'text-blue-700 bg-blue-50',
    purple: 'text-purple-700 bg-purple-50',
  }[highlightColor];

  return (
    <div
      className={`bg-white rounded-md border border-slate-200 border-l-4 ${borderColors} p-5 shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight font-mono">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-md ${iconColors} flex-shrink-0`}>{icon}</div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend.isPositive ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
