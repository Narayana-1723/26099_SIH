import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { CPSEBarChart, MonthlyTrendChart } from '../../components/dashboard/HarmonizationChart';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Boxes,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = ['#0f2942', '#047857', '#d97706', '#3b82f6', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const { overview, cpseStats, categoryStats, trends, isLoading, error } = useAnalytics();

  if (isLoading) {
    return <LoadingState message="Aggregating CPSE Platform Analytics..." subMessage="Computing real-time deduplication and coverage statistics" />;
  }

  if (error || !overview) {
    return <ErrorState message={error || 'Unable to load analytics metrics.'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Harmonization Analytics"
        description="Cross-CPSE data intelligence, deduplication progress, and machine learning accuracy indicators"
        breadcrumbs={[{ label: 'Analytics' }]}
        actions={
          <Link to="/user/reports" className="btn-primary text-xs flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Generate Official Report</span>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total CPSE Materials"
          value={overview.totalMaterials.toLocaleString()}
          subtitle="8 Contributing CPSEs"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="navy"
        />
        <StatCard
          title="Harmonized Items"
          value={overview.harmonizedMaterials.toLocaleString()}
          subtitle={`${Math.round((overview.harmonizedMaterials / overview.totalMaterials) * 100)}% coverage`}
          icon={<Sparkles className="w-5 h-5" />}
          trend={{ value: '+4.2% MoM', isPositive: true }}
          highlightColor="emerald"
        />
        <StatCard
          title="Overall Model Accuracy"
          value={`${overview.overallAccuracyRate}%`}
          subtitle="Validated by human review"
          icon={<Award className="w-5 h-5" />}
          highlightColor="blue"
        />
        <StatCard
          title="Identified Duplicates"
          value={overview.potentialDuplicates.toLocaleString()}
          subtitle="Cross-enterprise redundancy"
          icon={<Layers className="w-5 h-5" />}
          highlightColor="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPSE Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gov-navy mb-1">
            Harmonization Volumes Across CPSE Enterprises
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comparison of harmonized records, pending reviews, and discovered duplicates
          </p>
          <CPSEBarChart data={cpseStats} />
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gov-navy mb-1">
            Materials Ingestion by Technical Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Proportional representation of technical domains
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f2942',
                    borderColor: '#1e3a8a',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${val.toLocaleString()} materials`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingestion & Processing Timeline */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-bold text-gov-navy mb-1">
            Monthly Ingestion &amp; Harmonization Trajectory
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Historical progression of batch intake vs. automated harmonization volume
          </p>
          <MonthlyTrendChart data={trends} />
        </div>
      </div>
    </div>
  );
};
