CREATE TABLE IF NOT EXISTS canonical_material (
    id BIGSERIAL PRIMARY KEY,
    canonical_code VARCHAR(100) NOT NULL UNIQUE,
    standard_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    taxonomy_id BIGINT REFERENCES taxonomy(id) ON DELETE SET NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEPRECATED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canonical_code ON canonical_material(canonical_code);
CREATE INDEX IF NOT EXISTS idx_canonical_category ON canonical_material(category);
CREATE INDEX IF NOT EXISTS idx_canonical_taxonomy ON canonical_material(taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_canonical_status ON canonical_material(status);
