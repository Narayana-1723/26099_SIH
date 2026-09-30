import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { CPSEBarChart, MonthlyTrendChart } from '../../components/dashboard/HarmonizationChart';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { BarChart3, TrendingUp, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { overview, cpseStats, trends, isLoading, error } = useAnalytics();

  if (isLoading) {
    return <LoadingState message="Loading Consortium Analytics..." />;
  }

  if (error || !overview) {
    return <ErrorState message={error || 'Failed to aggregate metrics'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consortium Master Analytics &amp; Deduplication ROI"
        description="Macro-level metrics across all participating Central Public Sector Enterprises"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'Analytics' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Consortium Records"
          value={overview.totalMaterials.toLocaleString()}
          subtitle="Total repository size"
          icon={<BarChart3 className="w-5 h-5" />}
          highlightColor="navy"
        />
        <StatCard
          title="Consortium Coverage"
          value={`${Math.round((overview.harmonizedMaterials / overview.totalMaterials) * 100)}%`}
          subtitle={`${overview.harmonizedMaterials.toLocaleString()} records`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Cross-CPSE Redundancy"
          value={overview.potentialDuplicates.toLocaleString()}
          subtitle="Estimated ₹420 Cr joint savings"
          icon={<Layers className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${overview.overallAccuracyRate}%`}
          subtitle="Validated against BIS / ISO"
          icon={<ShieldCheck className="w-5 h-5" />}
          highlightColor="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
            Enterprise Harmonization Volumes
          </h3>
          <CPSEBarChart data={cpseStats} />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
            Monthly Production Ingestion Timeline
          </h3>
          <MonthlyTrendChart data={trends} />
        </div>
      </div>
    </div>
  );
};
