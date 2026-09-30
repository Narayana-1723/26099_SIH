import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { CPSEBarChart, MonthlyTrendChart } from '../../components/dashboard/HarmonizationChart';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Boxes,
  Sparkles,
  Clock,
  CopyCheck,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { overview, cpseStats, trends, isLoading, error } = useAnalytics();

  if (isLoading) {
    return <LoadingState message="Loading Harmonization Analytics..." subMessage="Fetching data metrics across CPSE nodes" />;
  }

  if (error || !overview) {
    return <ErrorState message={error || 'Unable to retrieve dashboard statistics.'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name || 'Officer'}`}
        description={`Connected Node: ${user?.cpse} &bull; Harmonization & Procurement Analytics`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/user/upload" className="btn-primary text-xs flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New Material Batch</span>
            </Link>
            <Link to="/user/review-queue" className="btn-secondary text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Review Queue ({overview.pendingReviews})</span>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          title="Total Ingested"
          value={overview.totalMaterials.toLocaleString()}
          subtitle="Across 8 CPSEs"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="navy"
        />
        <StatCard
          title="Processed"
          value={overview.processedMaterials.toLocaleString()}
          subtitle="NER & Vectorized"
          icon={<CheckCircle2 className="w-5 h-5" />}
          highlightColor="blue"
        />
        <StatCard
          title="Harmonized"
          value={overview.harmonizedMaterials.toLocaleString()}
          subtitle={`${Math.round((overview.harmonizedMaterials / overview.totalMaterials) * 100)}% coverage`}
          icon={<Sparkles className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Pending Review"
          value={overview.pendingReviews.toLocaleString()}
          subtitle="Human review queue"
          icon={<Clock className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Duplicates"
          value={overview.potentialDuplicates.toLocaleString()}
          subtitle="Cross-CPSE overlap"
          icon={<CopyCheck className="w-5 h-5" />}
          highlightColor="purple"
        />
        <StatCard
          title="Canonical Master"
          value={overview.canonicalMaterialsCount.toLocaleString()}
          subtitle="Unified items"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          highlightColor="navy"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPSE Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">Harmonization Progress by CPSE</h3>
              <p className="text-xs text-slate-500">Distribution of raw vs. harmonized items per enterprise</p>
            </div>
            <Link to="/user/analytics" className="text-xs font-semibold text-blue-700 hover:underline flex items-center">
              <span>Deep-dive</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <CPSEBarChart data={cpseStats} />
        </div>

        {/* Monthly Processing Trends */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gov-navy">Monthly Processing &amp; Harmonization Trends</h3>
              <p className="text-xs text-slate-500">Batch ingestions vs auto-harmonized records</p>
            </div>
            <Link to="/user/reports" className="text-xs font-semibold text-blue-700 hover:underline flex items-center">
              <span>Export</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <MonthlyTrendChart data={trends} />
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">AI Recommendation Engine</h4>
            <p className="text-xs text-slate-500 mt-1">
              Inspect candidates matched by semantic vectors with explainable similarity metrics.
            </p>
            <Link to="/user/harmonization" className="mt-2.5 inline-flex items-center text-xs font-semibold text-blue-700 hover:underline">
              <span>Explore Matches</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <CopyCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Cross-CPSE Duplicates</h4>
            <p className="text-xs text-slate-500 mt-1">
              Detect identical engineering parts identified across ONGC, BHEL, NTPC, and IOCL.
            </p>
            <Link to="/user/duplicates" className="mt-2.5 inline-flex items-center text-xs font-semibold text-amber-700 hover:underline">
              <span>Compare Duplicates</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Human Review Queue</h4>
            <p className="text-xs text-slate-500 mt-1">
              Validate borderline AI matches (confidence 70-85%) with 1-click approval or attribute editing.
            </p>
            <Link to="/user/review-queue" className="mt-2.5 inline-flex items-center text-xs font-semibold text-emerald-700 hover:underline">
              <span>Open Queue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
