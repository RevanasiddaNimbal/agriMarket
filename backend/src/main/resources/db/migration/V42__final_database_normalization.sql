
ALTER TABLE users RENAME COLUMN created_at TO created_date;
ALTER TABLE users RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE products RENAME COLUMN created_at TO created_date;
ALTER TABLE products RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE crop_info RENAME COLUMN created_at TO created_date;
ALTER TABLE crop_info RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE commodities RENAME COLUMN created_at TO created_date;
ALTER TABLE commodities RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE markets RENAME COLUMN created_at TO created_date;
ALTER TABLE markets RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE states RENAME COLUMN created_at TO created_date;
ALTER TABLE states RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE districts RENAME COLUMN created_at TO created_date;
ALTER TABLE districts RENAME COLUMN updated_at TO last_modified_date;

ALTER TABLE taluks RENAME COLUMN created_at TO created_date;
ALTER TABLE taluks RENAME COLUMN updated_at TO last_modified_date;

-- 2. Normalize order_address_snapshots to reference taluk_id and remove redundant state/district columns
ALTER TABLE order_address_snapshots
    ADD COLUMN taluk_id VARCHAR(36);

UPDATE order_address_snapshots oas
SET taluk_id = t.id
FROM taluks t
JOIN districts d ON d.id = t.district_id
JOIN states s ON s.id = d.state_id
WHERE oas.taluk_id IS NULL
  AND (LOWER(t.name) = LOWER(oas.city) OR LOWER(t.name) = LOWER(oas.district))
  AND LOWER(d.name) = LOWER(oas.district)
  AND LOWER(s.name) = LOWER(oas.state);

UPDATE order_address_snapshots oas
SET taluk_id = t.id
FROM taluks t
JOIN districts d ON d.id = t.district_id
JOIN states s ON s.id = d.state_id
WHERE oas.taluk_id IS NULL
  AND LOWER(d.name) = LOWER(oas.district)
  AND LOWER(s.name) = LOWER(oas.state);

UPDATE order_address_snapshots oas
SET taluk_id = (SELECT id FROM taluks LIMIT 1)
WHERE oas.taluk_id IS NULL;

ALTER TABLE order_address_snapshots
    ALTER COLUMN taluk_id SET NOT NULL;

ALTER TABLE order_address_snapshots
    ADD CONSTRAINT fk_order_address_snapshot_taluk
        FOREIGN KEY (taluk_id)
            REFERENCES taluks (id);

CREATE INDEX idx_order_address_snapshots_taluk_id
    ON order_address_snapshots (taluk_id);

ALTER TABLE order_address_snapshots
    DROP COLUMN district,
    DROP COLUMN state;

-- 3. Normalize product_location_snapshots to remove redundant state and district columns
ALTER TABLE product_location_snapshots
    DROP COLUMN district,
    DROP COLUMN state;

-- 4. Normalize Multivalued CropInfo fields (common_diseases & uses)
CREATE TABLE crop_info_common_diseases
(
    crop_info_id VARCHAR(36) NOT NULL,
    disease      TEXT        NOT NULL,

    CONSTRAINT pk_crop_info_common_diseases
        PRIMARY KEY (crop_info_id, disease),

    CONSTRAINT fk_crop_info_common_diseases_crop
        FOREIGN KEY (crop_info_id)
            REFERENCES crop_info (id)
            ON DELETE CASCADE,

    CONSTRAINT chk_crop_info_common_diseases_disease_not_blank
        CHECK (BTRIM(disease) <> '')
);

CREATE INDEX idx_crop_info_common_diseases_disease
    ON crop_info_common_diseases (disease);

CREATE TABLE crop_info_uses
(
    crop_info_id VARCHAR(36) NOT NULL,
    use_case     TEXT        NOT NULL,

    CONSTRAINT pk_crop_info_uses
        PRIMARY KEY (crop_info_id, use_case),

    CONSTRAINT fk_crop_info_uses_crop
        FOREIGN KEY (crop_info_id)
            REFERENCES crop_info (id)
            ON DELETE CASCADE,

    CONSTRAINT chk_crop_info_uses_use_case_not_blank
        CHECK (BTRIM(use_case) <> '')
);

CREATE INDEX idx_crop_info_uses_use_case
    ON crop_info_uses (use_case);

INSERT INTO crop_info_common_diseases (crop_info_id, disease)
SELECT c.id,
       BTRIM(token.value)
FROM crop_info c
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(c.common_diseases, ''), '\s*,\s*') AS token(value)
WHERE NULLIF(BTRIM(token.value), '') IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO crop_info_uses (crop_info_id, use_case)
SELECT c.id,
       BTRIM(token.value)
FROM crop_info c
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(c.uses, ''), '\s*,\s*') AS token(value)
WHERE NULLIF(BTRIM(token.value), '') IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE crop_info
    DROP COLUMN IF EXISTS common_diseases,
    DROP COLUMN IF EXISTS uses;
