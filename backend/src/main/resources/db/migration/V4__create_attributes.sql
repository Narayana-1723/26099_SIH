CREATE TABLE IF NOT EXISTS material_attribute (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES material(id) ON DELETE CASCADE,
    category VARCHAR(100),
    item_type VARCHAR(100),
    material VARCHAR(100),
    grade VARCHAR(50),
    diameter VARCHAR(50),
    length VARCHAR(50),
    width VARCHAR(50),
    height VARCHAR(50),
    pressure_class VARCHAR(50),
    voltage VARCHAR(50),
    unit VARCHAR(30),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    additional_attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_material_attribute_material UNIQUE (material_id)
);

CREATE INDEX IF NOT EXISTS idx_attr_material_id ON material_attribute(material_id);
CREATE INDEX IF NOT EXISTS idx_attr_category ON material_attribute(category);
CREATE INDEX IF NOT EXISTS idx_attr_item_type ON material_attribute(item_type);
CREATE INDEX IF NOT EXISTS idx_attr_material ON material_attribute(material);
CREATE INDEX IF NOT EXISTS idx_attr_grade ON material_attribute(grade);
