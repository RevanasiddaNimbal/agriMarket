CREATE TABLE order_address_snapshots
(
    id                 VARCHAR(36) PRIMARY KEY,
    order_id           VARCHAR(36)    NOT NULL,
    address_line1      VARCHAR(200)   NOT NULL,
    address_line2      VARCHAR(200),
    village            VARCHAR(100),
    city               VARCHAR(100)   NOT NULL,
    district           VARCHAR(100)   NOT NULL,
    state              VARCHAR(100)   NOT NULL,
    pincode            VARCHAR(10)    NOT NULL,
    country            VARCHAR(100)   NOT NULL DEFAULT 'India',
    latitude           NUMERIC(10, 7),
    longitude          NUMERIC(10, 7),
    location_type      VARCHAR(20)    NOT NULL,
    address_type       VARCHAR(20)    NOT NULL,
    created_date       TIMESTAMP      NOT NULL,
    last_modified_date TIMESTAMP      NOT NULL,
    created_by         VARCHAR(255),
    last_modified_by   VARCHAR(255),

    CONSTRAINT uk_order_address_snapshots_order_id
        UNIQUE (order_id),

    CONSTRAINT fk_order_address_snapshot_order
        FOREIGN KEY (order_id)
            REFERENCES orders (id)
);

INSERT INTO order_address_snapshots (
    id,
    order_id,
    address_line1,
    address_line2,
    village,
    city,
    district,
    state,
    pincode,
    country,
    latitude,
    longitude,
    location_type,
    address_type,
    created_date,
    last_modified_date,
    created_by,
    last_modified_by
)
SELECT
    o.id,
    o.id,
    a.address_line1,
    a.address_line2,
    a.village,
    a.city,
    a.district,
    a.state,
    a.pincode,
    a.country,
    a.latitude,
    a.longitude,
    a.location_type,
    a.address_type,
    o.created_date,
    o.last_modified_date,
    o.created_by,
    o.last_modified_by
FROM orders o
JOIN addresses a ON a.id = o.address_id;

ALTER TABLE orders
DROP CONSTRAINT fk_order_address;

ALTER TABLE orders
DROP COLUMN address_id;

CREATE INDEX idx_order_address_snapshots_order_id
    ON order_address_snapshots (order_id);
