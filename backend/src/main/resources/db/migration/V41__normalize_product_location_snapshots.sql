CREATE TABLE product_location_snapshots
(
    id                 VARCHAR(36) PRIMARY KEY,
    address_line1      VARCHAR(200) NOT NULL,
    address_line2      VARCHAR(200),
    village            VARCHAR(100),
    city               VARCHAR(100) NOT NULL,
    district           VARCHAR(100) NOT NULL,
    state              VARCHAR(100) NOT NULL,
    pincode            VARCHAR(10)  NOT NULL DEFAULT '580001',
    country            VARCHAR(100) NOT NULL DEFAULT 'India',
    latitude           NUMERIC(10, 7),
    longitude          NUMERIC(10, 7),
    location_type      VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',
    address_type       VARCHAR(20)  NOT NULL DEFAULT 'FARM',
    taluk_id           VARCHAR(36),
    created_date       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         VARCHAR(255),
    last_modified_by   VARCHAR(255),

    CONSTRAINT fk_product_location_snapshot_taluk
        FOREIGN KEY (taluk_id)
            REFERENCES taluks (id)
);

ALTER TABLE products
    ADD COLUMN product_location_snapshot_id VARCHAR(36);

INSERT INTO product_location_snapshots (
    id,
    address_line1,
    city,
    district,
    state,
    pincode,
    country,
    location_type,
    address_type,
    taluk_id,
    created_date,
    last_modified_date
)
SELECT
    p.id,
    COALESCE(t.name, 'Farm Location'),
    COALESCE(t.name, 'Unknown'),
    COALESCE(d.name, 'Unknown'),
    COALESCE(s.name, 'Unknown'),
    '580001',
    'India',
    'MANUAL',
    'FARM',
    p.taluk_id,
    COALESCE(p.created_at, CURRENT_TIMESTAMP),
    COALESCE(p.updated_at, CURRENT_TIMESTAMP)
FROM products p
LEFT JOIN taluks t ON t.id = p.taluk_id
LEFT JOIN districts d ON d.id = t.district_id
LEFT JOIN states s ON s.id = d.state_id;

UPDATE products p
SET product_location_snapshot_id = p.id;

ALTER TABLE products
    ALTER COLUMN product_location_snapshot_id SET NOT NULL;

ALTER TABLE products
    ADD CONSTRAINT fk_products_location_snapshot
        FOREIGN KEY (product_location_snapshot_id)
            REFERENCES product_location_snapshots (id);

CREATE INDEX idx_products_location_snapshot_id
    ON products (product_location_snapshot_id);

ALTER TABLE products
    DROP CONSTRAINT IF EXISTS fk_products_taluk;

DROP INDEX IF EXISTS idx_products_taluk_id;

ALTER TABLE products
    DROP COLUMN IF EXISTS taluk_id;
