CREATE TABLE IF NOT EXISTS taxonomy (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES taxonomy(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_taxonomy_code ON taxonomy(code);
CREATE INDEX IF NOT EXISTS idx_taxonomy_parent ON taxonomy(parent_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_level ON taxonomy(level);
CREATE INDEX IF NOT EXISTS idx_taxonomy_active ON taxonomy(active);
