CREATE TABLE IF NOT EXISTS material_match (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES material(id) ON DELETE CASCADE,
    matched_material_id BIGINT REFERENCES material(id) ON DELETE SET NULL,
    canonical_material_id BIGINT REFERENCES canonical_material(id) ON DELETE SET NULL,
    semantic_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    lexical_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    attribute_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    final_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    match_type VARCHAR(50) NOT NULL CHECK (match_type IN ('EXACT', 'POTENTIAL_EQUIVALENT', 'SIMILAR', 'NOT_MATCH')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    explanation JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_material_id ON material_match(material_id);
CREATE INDEX IF NOT EXISTS idx_match_matched_material_id ON material_match(matched_material_id);
CREATE INDEX IF NOT EXISTS idx_match_canonical_id ON material_match(canonical_material_id);
CREATE INDEX IF NOT EXISTS idx_match_status ON material_match(status);
CREATE INDEX IF NOT EXISTS idx_match_confidence ON material_match(final_confidence);
CREATE INDEX IF NOT EXISTS idx_match_type ON material_match(match_type);
