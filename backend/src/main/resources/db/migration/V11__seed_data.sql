-- Seed CPSEs
INSERT INTO cpse (id, name, code, description, active) VALUES
(1, 'Oil and Natural Gas Corporation', 'ONGC', 'Indian central public sector undertaking under the Ministry of Petroleum and Natural Gas', true),
(2, 'Bharat Heavy Electricals Limited', 'BHEL', 'Indian central public sector undertaking and largest power generation equipment manufacturer', true),
(3, 'Indian Oil Corporation Limited', 'IOCL', 'Indian central public sector undertaking under the Ministry of Petroleum and Natural Gas', true),
(4, 'NTPC Limited', 'NTPC', 'Indian central public sector undertaking under the Ministry of Power', true),
(5, 'Steel Authority of India Limited', 'SAIL', 'Indian central public sector undertaking under the Ministry of Steel', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Users (passwords will also be verified/updated by DataInitializer if needed)
-- Password for all seed users is: password
INSERT INTO users (id, employee_id, name, email, password_hash, role, cpse_id, active) VALUES
(1, 'ADM001', 'System Administrator', 'admin@sih.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 1, true),
(2, 'REV001', 'Senior Material Reviewer', 'reviewer@sih.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'REVIEWER', 2, true),
(3, 'USR001', 'Standard CPSE Officer', 'user@ongc.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Hierarchical Taxonomy
-- Level 1: Root Categories
INSERT INTO taxonomy (id, parent_id, code, name, description, level, active) VALUES
(1, NULL, 'MECH', 'Mechanical', 'Mechanical engineering components, fasteners, valves, piping', 1, true),
(2, NULL, 'ELEC', 'Electrical', 'Electrical components, instrumentation, switchgears, cables', 1, true),
(3, NULL, 'CIVIL', 'Civil & Structural', 'Civil engineering and structural materials', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Level 2: Sub-categories
INSERT INTO taxonomy (id, parent_id, code, name, description, level, active) VALUES
(10, 1, 'MECH-FAST', 'Fasteners', 'Bolts, nuts, washers, studs, screws', 2, true),
(11, 1, 'MECH-BEAR', 'Bearings', 'Ball, roller, thrust, and plain bearings', 2, true),
(12, 1, 'MECH-SEAL', 'Seals & Gaskets', 'Mechanical seals, O-rings, spiral wound gaskets', 2, true),
(13, 1, 'MECH-VALV', 'Valves & Fittings', 'Gate, ball, check, globe valves and flanges', 2, true),
(20, 2, 'ELEC-CABL', 'Cables & Wires', 'Power cables, control cables, instrumentation wires', 2, true),
(21, 2, 'ELEC-SWIT', 'Switches & Relays', 'Circuit breakers, contactors, push buttons, relays', 2, true),
(22, 2, 'ELEC-CONN', 'Connectors & Terminals', 'Industrial connectors, terminal blocks, lugs', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Level 3: Item Types
INSERT INTO taxonomy (id, parent_id, code, name, description, level, active) VALUES
(100, 10, 'FAST-BOLT', 'Bolts', 'Hexagonal, socket head, eye bolts, u-bolts', 3, true),
(101, 10, 'FAST-NUT', 'Nuts', 'Hex nuts, nyloc nuts, flange nuts', 3, true),
(102, 10, 'FAST-WASH', 'Washers', 'Flat washers, spring washers, conical washers', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Canonical Materials
INSERT INTO canonical_material (id, canonical_code, standard_name, category, taxonomy_id, description, status) VALUES
(1, 'CM-000124', 'Stainless Steel 316 Hex Bolt M16 × 50 mm', 'Fasteners', 100, 'Standard metric coarse thread hexagonal bolt, Grade SS316, DIN 933 / ISO 4017 fully threaded', 'ACTIVE'),
(2, 'CM-000125', 'Stainless Steel 316 Hex Bolt M16 × 100 mm', 'Fasteners', 100, 'Standard metric coarse thread hexagonal bolt, Grade SS316, DIN 931 / ISO 4014 partially threaded', 'ACTIVE'),
(3, 'CM-000201', 'Deep Groove Ball Bearing 6205-2RS', 'Bearings', 11, 'Single row deep groove ball bearing with rubber seals on both sides, 25x52x15 mm', 'ACTIVE'),
(4, 'CM-000305', 'Spiral Wound Gasket 2 inch 150# SS316 Graphite', 'Seals & Gaskets', 12, 'Spiral wound metallic gasket with graphite filler, ASME B16.20 class 150', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Materials
INSERT INTO material (id, cpse_id, original_material_code, original_description, normalized_description, source_file, status) VALUES
(1, 1, 'BOLT-HEX-SS316-M16X50', 'BOLT HEX HEAD SS316 M16 X 50MM FULLY THREADED DIN 933', 'hex bolt ss316 m16 x 50mm din933', 'ongc_master_2026.csv', 'HARMONIZED'),
(2, 2, '16MM SS316 HEXAGON BOLT 50L', '16MM SS 316 HEXAGONAL BOLT 50 MM LENGTH', 'hex bolt ss316 m16 x 50mm', 'bhel_inventory.xlsx', 'HARMONIZED'),
(3, 3, 'M16-50-SS316-HEX-B', 'HEX BOLT STAINLESS STEEL 316 SIZE M16 LENGTH 50', 'hex bolt ss316 m16 x 50mm', 'iocl_spares.csv', 'REVIEW_REQUIRED'),
(4, 1, 'BOLT-HEX-SS316-M16X100', 'BOLT HEX HEAD SS316 M16 X 100MM DIN 931', 'hex bolt ss316 m16 x 100mm din931', 'ongc_master_2026.csv', 'PROCESSED')
ON CONFLICT (id) DO NOTHING;

-- Seed Attributes for Materials
INSERT INTO material_attribute (id, material_id, category, item_type, material, grade, diameter, length, unit, additional_attributes) VALUES
(1, 1, 'Fasteners', 'Hex Bolt', 'Stainless Steel', '316', 'M16', '50 mm', 'mm', '{"standard": "DIN 933", "thread": "Full"}'::jsonb),
(2, 2, 'Fasteners', 'Hex Bolt', 'Stainless Steel', '316', 'M16', '50 mm', 'mm', '{"thread": "Full"}'::jsonb),
(3, 3, 'Fasteners', 'Hex Bolt', 'Stainless Steel', '316', 'M16', '50 mm', 'mm', '{"head": "Hexagonal"}'::jsonb),
(4, 4, 'Fasteners', 'Hex Bolt', 'Stainless Steel', '316', 'M16', '100 mm', 'mm', '{"standard": "DIN 931"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Material Matches
INSERT INTO material_match (id, material_id, matched_material_id, canonical_material_id, semantic_score, lexical_score, attribute_score, final_confidence, match_type, status, explanation) VALUES
(1, 2, 1, 1, 0.94, 0.88, 1.0, 0.94, 'EXACT', 'APPROVED', '{"reason": "Identical dimensions, grade and item type across ONGC and BHEL catalogs", "matchedAttributes": ["itemType", "grade", "diameter", "length"]}'::jsonb),
(2, 3, 1, 1, 0.91, 0.83, 1.0, 0.91, 'POTENTIAL_EQUIVALENT', 'PENDING', '{"reason": "High semantic and exact attribute correspondence with CM-000124", "matchedAttributes": ["itemType", "grade", "diameter", "length"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Update sequences for PostgreSQL
SELECT setval('cpse_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cpse));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('taxonomy_id_seq', (SELECT COALESCE(MAX(id), 1) FROM taxonomy));
SELECT setval('canonical_material_id_seq', (SELECT COALESCE(MAX(id), 1) FROM canonical_material));
SELECT setval('material_id_seq', (SELECT COALESCE(MAX(id), 1) FROM material));
SELECT setval('material_attribute_id_seq', (SELECT COALESCE(MAX(id), 1) FROM material_attribute));
SELECT setval('material_match_id_seq', (SELECT COALESCE(MAX(id), 1) FROM material_match));
