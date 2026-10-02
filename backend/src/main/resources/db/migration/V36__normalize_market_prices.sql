CREATE TABLE commodities
(
    id         VARCHAR(36) PRIMARY KEY,
    name       VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commodities_name
    ON commodities (name);

CREATE TABLE markets
(
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    district_id VARCHAR(36)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_markets_district
        FOREIGN KEY (district_id)
            REFERENCES districts (id),
    CONSTRAINT uk_markets_district_name
        UNIQUE (district_id, name)
);

CREATE INDEX idx_markets_district_id
    ON markets (district_id);

CREATE INDEX idx_markets_name
    ON markets (name);

INSERT INTO states
(
    id,
    name,
    code,
    country_code,
    is_active,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()::VARCHAR,
    mp.state,
    UPPER(LEFT(mp.state, 3)),
    'IN',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM market_prices mp
         LEFT JOIN states s
                   ON LOWER(s.name) = LOWER(mp.state)
WHERE mp.state IS NOT NULL
  AND mp.state <> ''
  AND s.id IS NULL
GROUP BY mp.state;

INSERT INTO districts
(
    id,
    state_id,
    name,
    code,
    is_active,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()::VARCHAR,
    s.id,
    mp.district,
    UPPER(LEFT(mp.district, 6)),
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM market_prices mp
         JOIN states s
              ON LOWER(s.name) = LOWER(mp.state)
         LEFT JOIN districts d
                   ON d.state_id = s.id
                       AND LOWER(d.name) = LOWER(mp.district)
WHERE mp.state IS NOT NULL
  AND mp.district IS NOT NULL
  AND mp.state <> ''
  AND mp.district <> ''
  AND d.id IS NULL
GROUP BY s.id, mp.district;

INSERT INTO commodities
(
    id,
    name
)
SELECT
    gen_random_uuid()::VARCHAR,
    mp.commodity
FROM market_prices mp
WHERE mp.commodity IS NOT NULL
  AND mp.commodity <> ''
GROUP BY mp.commodity;

INSERT INTO markets
(
    id,
    name,
    district_id
)
SELECT
    gen_random_uuid()::VARCHAR,
    mp.market,
    d.id
FROM market_prices mp
         JOIN states s
              ON LOWER(s.name) = LOWER(mp.state)
         JOIN districts d
              ON d.state_id = s.id
                  AND LOWER(d.name) = LOWER(mp.district)
WHERE mp.market IS NOT NULL
  AND mp.market <> ''
GROUP BY d.id, mp.market;

ALTER TABLE market_prices
    ADD COLUMN commodity_id VARCHAR(36),
    ADD COLUMN market_id    VARCHAR(36);

UPDATE market_prices mp
SET commodity_id = c.id
    FROM commodities c
WHERE LOWER(c.name) = LOWER(mp.commodity);

UPDATE market_prices mp
SET market_id = m.id
    FROM markets m
JOIN districts d
ON d.id = m.district_id
    JOIN states s
    ON s.id = d.state_id
WHERE LOWER(m.name) = LOWER(mp.market)
  AND LOWER(d.name) = LOWER(mp.district)
  AND LOWER(s.name) = LOWER(mp.state);

ALTER TABLE market_prices
    ALTER COLUMN commodity_id SET NOT NULL,
ALTER COLUMN market_id SET NOT NULL;

ALTER TABLE market_prices
    ADD CONSTRAINT fk_market_prices_commodity
        FOREIGN KEY (commodity_id)
            REFERENCES commodities (id),
    ADD CONSTRAINT fk_market_prices_market
        FOREIGN KEY (market_id)
            REFERENCES markets (id);

ALTER TABLE market_prices
DROP CONSTRAINT IF EXISTS uk_market_price_unique;

DROP INDEX IF EXISTS idx_market_price_commodity;
DROP INDEX IF EXISTS idx_market_price_state;
DROP INDEX IF EXISTS idx_market_price_district;
DROP INDEX IF EXISTS idx_market_price_market;

ALTER TABLE market_prices
DROP COLUMN commodity,
    DROP COLUMN state,
    DROP COLUMN district,
    DROP COLUMN market;

ALTER TABLE market_prices
    ADD CONSTRAINT uk_market_price_unique
        UNIQUE (commodity_id, market_id, arrival_date);

CREATE INDEX idx_market_price_commodity_id
    ON market_prices (commodity_id);

CREATE INDEX idx_market_price_market_id
    ON market_prices (market_id);