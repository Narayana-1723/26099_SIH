CREATE TABLE IF NOT EXISTS processing_job (
    id BIGSERIAL PRIMARY KEY,
    job_code VARCHAR(100) NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    cpse_id BIGINT NOT NULL REFERENCES cpse(id) ON DELETE RESTRICT,
    total_records INT NOT NULL DEFAULT 0,
    processed_records INT NOT NULL DEFAULT 0,
    failed_records INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_code ON processing_job(job_code);
CREATE INDEX IF NOT EXISTS idx_job_status ON processing_job(status);
CREATE INDEX IF NOT EXISTS idx_job_cpse_id ON processing_job(cpse_id);
CREATE INDEX IF NOT EXISTS idx_job_created_at ON processing_job(created_at);
