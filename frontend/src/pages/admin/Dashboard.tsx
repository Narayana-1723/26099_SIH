import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { analyticsService } from '../../services/analyticsService';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { OverviewStats, MLModelStatus } from '../../types/analytics';
import { User } from '../../types/user';
import {
  Users,
  Boxes,
  Database,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Server,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [modelStatus, setModelStatus] = useState<MLModelStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [st, ms, us] = await Promise.all([
          analyticsService.getOverview(),
          adminService.getModelStatus(),
          adminService.getUsers(),
        ]);
        setStats(st);
        setModelStatus(ms);
        setUsers(us);
      } catch (err: any) {
        setError(err.message || 'Failed to load administrative overview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Connecting to Administrative Control Node..." subMessage="Checking cluster status, database replication, and ML service" />;
  }

  if (error || !stats || !modelStatus) {
    return <ErrorState message={error || 'Administrative metrics unavailable.'} />;
  }

  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consortium Administration Console"
        description="Cross-CPSE Governance &bull; High-Privilege Master Management &amp; System Health Monitoring"
        breadcrumbs={[{ label: 'Admin Console' }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Platform Operational
          </span>
        }
      />

      {/* System KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Officers"
          value={`${activeUsersCount} / ${users.length}`}
          subtitle="Active / Total Provisioned"
          icon={<Users className="w-5 h-5" />}
          highlightColor="navy"
        />
        <StatCard
          title="Total Ingested Materials"
          value={stats.totalMaterials.toLocaleString()}
          subtitle="All 8 CPSE instances"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="blue"
        />
        <StatCard
          title="Pending SLA Reviews"
          value={stats.pendingReviews.toLocaleString()}
          subtitle="Flagged for manual audit"
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="ML Inference Service"
          value="Healthy"
          subtitle={`Latency: ${modelStatus.metrics.averageLatencyMs} ms`}
          icon={<Cpu className="w-5 h-5" />}
          highlightColor="emerald"
        />
      </div>

      {/* Infrastructure & Subsystem Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subsystem 1: Spring Boot Backend */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gov-navy" />
              <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Spring Boot REST Backend
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Framework:</span>
              <span className="font-mono text-slate-800 font-semibold">Spring Boot 3.2.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Database:</span>
              <span className="font-mono text-slate-800 font-semibold">PostgreSQL 16.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security:</span>
              <span className="font-mono text-slate-800">Spring Security JWT (RBAC)</span>
            </div>
          </div>
        </div>

        {/* Subsystem 2: Python ML Engine */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Python FastAPI ML Service
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {modelStatus.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Embeddings:</span>
              <span className="font-mono text-slate-800">{modelStatus.models.embeddingModel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vector Engine:</span>
              <span className="font-mono text-slate-800">{modelStatus.models.vectorIndex.engine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">24h Inferences:</span>
              <span className="font-mono font-bold text-slate-900">{modelStatus.metrics.requestsProcessedLast24h.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <Link to="/admin/model-status" className="text-xs text-blue-700 font-semibold hover:underline flex items-center">
              <span>View detailed ML telemetry</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Subsystem 3: Administrative Quick Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gov-navy" />
              <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Management Workflows
              </h4>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <Link
              to="/admin/users"
              className="block p-2 rounded bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 transition-colors"
            >
              &rarr; Manage User Identities &amp; Roles
            </Link>
            <Link
              to="/admin/data-management"
              className="block p-2 rounded bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 transition-colors"
            >
              &rarr; Ingestion Jobs &amp; Batch Cleanup
            </Link>
            <Link
              to="/admin/audit-logs"
              className="block p-2 rounded bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 transition-colors"
            >
              &rarr; Security &amp; Transaction Audit Log
            </Link>
            <Link
              to="/admin/settings"
              className="block p-2 rounded bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 transition-colors"
            >
              &rarr; Platform Confidence Thresholds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
