CREATE TABLE IF NOT EXISTS review (
    id BIGSERIAL PRIMARY KEY,
    material_match_id BIGINT NOT NULL REFERENCES material_match(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision VARCHAR(30) NOT NULL CHECK (decision IN ('APPROVE', 'REJECT', 'MODIFY')),
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_match_id ON review(material_match_id);
CREATE INDEX IF NOT EXISTS idx_review_reviewer_id ON review(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_decision ON review(decision);
CREATE INDEX IF NOT EXISTS idx_review_reviewed_at ON review(reviewed_at);
