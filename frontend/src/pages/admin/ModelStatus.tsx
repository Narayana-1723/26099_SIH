import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';
import { ModelHealthCard } from '../../components/admin/ModelHealthCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { MLModelStatus } from '../../types/analytics';
import { RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminModelStatus: React.FC = () => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<MLModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getModelStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve ML service health');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualCheck = async () => {
    await fetchStatus();
    showToast('success', 'Health Check Completed', 'ML service components verified operational.');
  };

  if (isLoading && !status) {
    return <LoadingState message="Polling ML Model Microservice..." subMessage="Contacting Python FastAPI endpoint" />;
  }

  if (error || !status) {
    return <ErrorState message={error || 'ML Service unreachable'} onRetry={fetchStatus} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI / ML Microservice Telemetry"
        description="Health, latencies, and operational status of the Python FastAPI Natural Language Processing &amp; Vector Indexing pipelines"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'AI/ML Status' }]}
        actions={
          <button
            onClick={handleManualCheck}
            disabled={isLoading}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Trigger Health Check</span>
          </button>
        }
      />

      <ModelHealthCard status={status} />
    </div>
  );
};
