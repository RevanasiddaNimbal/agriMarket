ALTER TABLE addresses
    ADD COLUMN taluk_id VARCHAR(36);

UPDATE addresses a
SET taluk_id = t.id
    FROM taluks t
JOIN districts d ON t.district_id = d.id
    JOIN states s ON d.state_id = s.id
WHERE a.taluk_id IS NULL
  AND LOWER(s.name) = LOWER(a.state)
  AND LOWER(d.name) = LOWER(a.district)
  AND LOWER(t.name) = LOWER(a.city);

UPDATE addresses a
SET taluk_id = t.id
    FROM taluks t
JOIN districts d ON t.district_id = d.id
    JOIN states s ON d.state_id = s.id
WHERE a.taluk_id IS NULL
  AND LOWER(s.name) = LOWER(a.state)
  AND LOWER(d.name) = LOWER(a.district)
  AND LOWER(t.name) = LOWER(d.name);

UPDATE addresses a
SET taluk_id = t.id
    FROM states s
JOIN districts d ON d.state_id = s.id
    JOIN LATERAL (
    SELECT t1.id
    FROM taluks t1
    WHERE t1.district_id = d.id
    ORDER BY t1.name
    LIMIT 1
    ) t ON TRUE
WHERE a.taluk_id IS NULL
  AND LOWER(s.name) = LOWER(a.state)
  AND LOWER(d.name) = LOWER(a.district);

DO $$
DECLARE
null_count INTEGER;
BEGIN
SELECT COUNT(*)
INTO null_count
FROM addresses
WHERE taluk_id IS NULL;

IF null_count > 0 THEN
        RAISE EXCEPTION 'Address normalization failed: % address(es) could not be mapped to a taluk', null_count;
END IF;
END $$;

ALTER TABLE addresses
    ALTER COLUMN taluk_id SET NOT NULL;

ALTER TABLE addresses
    ADD CONSTRAINT fk_addresses_taluk
        FOREIGN KEY (taluk_id)
            REFERENCES taluks (id);

ALTER TABLE addresses
DROP COLUMN state,
    DROP COLUMN district;

CREATE INDEX idx_addresses_taluk_id
    ON addresses (taluk_id);