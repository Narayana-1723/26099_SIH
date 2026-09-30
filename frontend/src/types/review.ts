import { Material } from './material';
import { CanonicalMaterial } from './canonical';
import { ScoreBreakdown, MatchExplanation } from './harmonization';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
export type ReviewPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReviewItem {
  id: string;
  material: Material;
  suggestedCanonical: CanonicalMaterial;
  scores: ScoreBreakdown;
  explanation: MatchExplanation;
  status: ReviewStatus;
  priority: ReviewPriority;
  assignedReviewer?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComments?: string;
  modifiedAttributes?: Record<string, string>;
  createdAt: string;
}

export interface ReviewActionPayload {
  action: 'APPROVE' | 'REJECT' | 'MODIFY';
  comments: string;
  modifiedCanonicalCode?: string;
  modifiedAttributes?: Record<string, string>;
}
