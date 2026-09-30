import React from 'react';
import { MLModelStatus } from '../../types/analytics';
import { Activity, CheckCircle, Database, Server, Zap } from 'lucide-react';

interface ModelHealthCardProps {
  status: MLModelStatus;
}

export const ModelHealthCard: React.FC<ModelHealthCardProps> = ({ status }) => {
  return (
    <div className="space-y-6">
      {/* Service Header Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{status.serviceName}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {status.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Service Build: <span className="font-mono font-semibold text-slate-700">{status.version}</span> &bull;
              Last Verified: {new Date(status.lastHealthCheck).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <div className="text-right">
            <span className="text-slate-500 block">Avg Response Latency</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {status.metrics.averageLatencyMs} ms
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">24h Ingestion Volume</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {status.metrics.requestsProcessedLast24h.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Model Pipelines Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NER Pipeline */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Named Entity Recognition (NER)
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {status.models.nerModel.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Model Artifact:</span>
              <span className="font-mono text-slate-800">{status.models.nerModel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Version:</span>
              <span className="font-mono text-slate-800">{status.models.nerModel.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inference Latency:</span>
              <span className="font-mono font-semibold text-emerald-700">{status.models.nerModel.latencyMs} ms</span>
            </div>
          </div>
        </div>

        {/* Semantic Embeddings */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Transformer Semantic Embedding
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Active
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Model Artifact:</span>
              <span className="font-mono text-slate-800">{status.models.embeddingModel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dense Dimensions:</span>
              <span className="font-mono text-slate-800">{status.models.embeddingModel.dimensions}-d</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Embedding Latency:</span>
              <span className="font-mono font-semibold text-emerald-700">{status.models.embeddingModel.latencyMs} ms</span>
            </div>
          </div>
        </div>

        {/* Hierarchical Classifier */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Taxonomy Category Classifier
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {status.models.classificationModel.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Model Artifact:</span>
              <span className="font-mono text-slate-800">{status.models.classificationModel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Version:</span>
              <span className="font-mono text-slate-800">{status.models.classificationModel.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inference Latency:</span>
              <span className="font-mono font-semibold text-emerald-700">{status.models.classificationModel.latencyMs} ms</span>
            </div>
          </div>
        </div>

        {/* Vector DB Index */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gov-navy" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Vector Index &amp; Similarity Engine
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {status.models.vectorIndex.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Indexing Engine:</span>
              <span className="font-mono text-slate-800">{status.models.vectorIndex.engine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Canonical Embeddings:</span>
              <span className="font-mono font-bold text-gov-navy">{status.models.vectorIndex.totalVectors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Error Rate:</span>
              <span className="font-mono font-semibold text-emerald-700">{status.metrics.errorRatePercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
