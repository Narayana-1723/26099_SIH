CREATE TABLE IF NOT EXISTS material (
    id BIGSERIAL PRIMARY KEY,
    cpse_id BIGINT NOT NULL REFERENCES cpse(id) ON DELETE RESTRICT,
    original_material_code VARCHAR(100) NOT NULL,
    original_description TEXT NOT NULL,
    normalized_description TEXT,
    source_file VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'RAW' CHECK (status IN ('RAW', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'HARMONIZED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_code ON material(original_material_code);
CREATE INDEX IF NOT EXISTS idx_material_cpse ON material(cpse_id);
CREATE INDEX IF NOT EXISTS idx_material_status ON material(status);
CREATE INDEX IF NOT EXISTS idx_material_created_at ON material(created_at);
