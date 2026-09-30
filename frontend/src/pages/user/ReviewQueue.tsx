import React, { useState } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ReviewItem, ReviewPriority } from '../../types/review';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { reviews, status, setStatus, isLoading, error, approve, reject, modify } = useReviews('PENDING');
  const { showToast } = useToast();

  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ReviewPriority>('ALL');

  // Action Dialog States
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);

  // Form comments
  const [actionComments, setActionComments] = useState('');
  const [modifiedAttributes, setModifiedAttributes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredReviews = reviews.filter((item) => {
    if (priorityFilter === 'ALL') return true;
    return item.priority === priorityFilter;
  });

  const handleOpenApprove = (item: ReviewItem) => {
    setSelectedItem(item);
    setActionComments('Verified technical equivalence against engineering documentation.');
    setApproveDialogOpen(true);
  };

  const handleOpenReject = (item: ReviewItem) => {
    setSelectedItem(item);
    setActionComments('Technical specifications or material grades are incompatible.');
    setRejectDialogOpen(true);
  };

  const handleOpenModify = (item: ReviewItem) => {
    setSelectedItem(item);
    setActionComments('');
    setModifiedAttributes({ ...item.material.attributes });
    setModifyModalOpen(true);
  };

  const executeApprove = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await approve(selectedItem.id, actionComments);
      showToast('success', 'Match Approved', `Material ${selectedItem.material.materialCode} successfully harmonized.`);
      setApproveDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message || 'Error approving match');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeReject = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await reject(selectedItem.id, actionComments);
      showToast('warning', 'Match Rejected', `Candidate mapping discarded for ${selectedItem.material.materialCode}.`);
      setRejectDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message || 'Error rejecting match');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!actionComments.trim()) {
      showToast('error', 'Comments Required', 'Please provide a technical reason for modification.');
      return;
    }
    setIsProcessing(true);
    try {
      await modify(selectedItem.id, {
        action: 'MODIFY',
        comments: actionComments,
        modifiedAttributes,
      });
      showToast('success', 'Attributes Modified', `Attributes updated for ${selectedItem.material.materialCode}.`);
      setModifyModalOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showToast('error', 'Modification Failed', err.message || 'Error modifying item');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Human Review Queue..." subMessage="Fetching items flagged for manual technical review" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human-in-the-Loop Review Queue"
        description="Verify, adjust, or reject AI-suggested canonical mappings for CPSE material catalogues"
        breadcrumbs={[{ label: 'Review Queue' }]}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {reviews.filter((r) => r.status === 'PENDING').length} Pending Audits
          </span>
        }
      />

      {/* Priority & Confidence Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            onClick={() => setStatus('PENDING')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              status === 'PENDING'
                ? 'bg-gov-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending ({reviews.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setStatus('APPROVED')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              status === 'APPROVED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatus('REJECTED')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              status === 'REJECTED'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Confidence Tier:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All Confidence Tiers</option>
            <option value="HIGH">High Priority (&lt;70% Score)</option>
            <option value="MEDIUM">Medium Priority (70-85% Score)</option>
            <option value="LOW">Low Priority (&gt;85% Score)</option>
          </select>
        </div>
      </div>

      {/* Review Items Stream */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Review Queue Cleared</h3>
          <p className="text-xs text-slate-500 mt-1">
            All material match candidates for this view have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs"
            >
              {/* Review Item Header */}
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-800 border border-slate-300">
                    {item.material.cpse}
                  </span>
                  <span className="font-mono text-xs font-bold text-gov-navy">
                    {item.material.materialCode}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">AI Recommendation Confidence:</span>
                  <ConfidenceBadge score={item.scores.finalConfidence} showBar={false} />
                </div>
              </div>

              {/* Comparison Details Grid */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Source Material */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>Originating Source Item ({item.material.cpse})</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono font-bold text-slate-900">
                    {item.material.originalDescription}
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold block mb-1">Normalized Representation:</span>
                    <div className="text-slate-800 font-medium bg-blue-50/40 p-2 rounded border border-blue-200">
                      {item.material.normalizedDescription}
                    </div>
                  </div>
                </div>

                {/* Right: Suggested Canonical Material */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Candidate Canonical Master Item</span>
                  </div>
                  <div className="p-3 bg-emerald-50/40 rounded border border-emerald-300 text-xs">
                    <div className="font-mono font-bold text-emerald-800">
                      {item.suggestedCanonical.canonicalCode}
                    </div>
                    <div className="font-bold text-slate-900 mt-1">
                      {item.suggestedCanonical.standardName}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold block mb-1">Standard Scope:</span>
                    <div className="text-slate-700 text-xs leading-relaxed">
                      {item.suggestedCanonical.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Attributes Differences Grid */}
              <div className="px-5 pb-4">
                <div className="border border-slate-200 rounded-md p-3 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    <span>Attribute Verification &amp; Gap Matrix</span>
                    <span>
                      Semantic: <strong>{item.scores.semanticScore}%</strong> &bull; Attribute:{' '}
                      <strong>{item.scores.attributeScore}%</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.explanation.matchedAttributes.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                        <span className="font-medium text-slate-600">{m.key}</span>
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-slate-900 font-bold">{m.targetValue}</span>
                        </div>
                      </div>
                    ))}
                    {item.explanation.unmatchedAttributes.map((u, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-amber-50/40 rounded border border-amber-300">
                        <span className="font-medium text-amber-900">{u.key}</span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-red-700">
                          <X className="w-3.5 h-3.5 text-red-500" />
                          <span>{u.targetValue || 'Missing'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {item.explanation.notes && (
                    <div className="mt-2 text-[11px] text-slate-600 italic">
                      Auditor Guidance: {item.explanation.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              {item.status === 'PENDING' && (
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Action requires logged justification for cross-enterprise audit logging.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReject(item)}
                      className="btn-danger text-xs flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Match</span>
                    </button>
                    <button
                      onClick={() => handleOpenModify(item)}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Modify Attributes</span>
                    </button>
                    <button
                      onClick={() => handleOpenApprove(item)}
                      className="btn-success text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Harmonize</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog: Approve */}
      <ConfirmationDialog
        isOpen={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={executeApprove}
        title="Confirm Material Harmonization Approval"
        message={`Are you sure you want to approve mapping ${selectedItem?.material.materialCode} (${selectedItem?.material.cpse}) to Canonical Material ${selectedItem?.suggestedCanonical.canonicalCode}? This action updates the unified material master.`}
        confirmLabel="Confirm Approval"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Confirmation Dialog: Reject */}
      <ConfirmationDialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={executeReject}
        title="Reject Match Candidate"
        message={`Reject candidate recommendation for ${selectedItem?.material.materialCode}? The item will be returned to the unmapped pool for manual cataloging.`}
        confirmLabel="Confirm Rejection"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Modal: Modify Attributes */}
      {selectedItem && (
        <Modal
          isOpen={modifyModalOpen}
          onClose={() => setModifyModalOpen(false)}
          title="Adjust Extracted Material Attributes"
          subtitle={`Editing parameters for ${selectedItem.material.materialCode} (${selectedItem.material.cpse})`}
          maxWidth="lg"
        >
          <form onSubmit={executeModify} className="space-y-4">
            <div className="space-y-3">
              {Object.entries(modifiedAttributes).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) =>
                      setModifiedAttributes((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Auditor Justification Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                placeholder="Explain the modification rationale (mandatory for audit trail)..."
                required
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModifyModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary text-xs"
              >
                {isProcessing ? 'Saving Changes...' : 'Save & Approve Attributes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
