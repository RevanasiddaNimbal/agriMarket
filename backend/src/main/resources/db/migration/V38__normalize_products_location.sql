ALTER TABLE products
    ADD COLUMN taluk_id VARCHAR(36);

UPDATE products p
SET taluk_id = t.id
FROM (
    SELECT id, name,
           ROW_NUMBER() OVER (PARTITION BY regexp_replace(LOWER(TRIM(name)), '[^a-z0-9]', '', 'g') ORDER BY name, id) AS rn
    FROM taluks
    WHERE is_active = true
) t
WHERE p.taluk_id IS NULL
  AND t.rn = 1
  AND (
      regexp_replace(LOWER(TRIM(t.name)), '[^a-z0-9]', '', 'g') =
      regexp_replace(LOWER(TRIM(p.location)), '[^a-z0-9]', '', 'g')
      OR LOWER(p.location) LIKE '%' || LOWER(t.name) || '%'
  );

UPDATE products p
SET taluk_id = t.id
FROM districts d
JOIN LATERAL (
    SELECT id FROM taluks WHERE district_id = d.id AND is_active = true ORDER BY name, id LIMIT 1
) t ON TRUE
WHERE p.taluk_id IS NULL
  AND (
      regexp_replace(LOWER(TRIM(d.name)), '[^a-z0-9]', '', 'g') =
      regexp_replace(LOWER(TRIM(p.location)), '[^a-z0-9]', '', 'g')
      OR LOWER(p.location) LIKE '%' || LOWER(d.name) || '%'
  );

UPDATE products p
SET taluk_id = t.id
FROM states s
JOIN districts d ON d.state_id = s.id AND d.is_active = true
JOIN LATERAL (
    SELECT id FROM taluks WHERE district_id = d.id AND is_active = true ORDER BY name, id LIMIT 1
) t ON TRUE
WHERE p.taluk_id IS NULL
  AND (
      regexp_replace(LOWER(TRIM(s.name)), '[^a-z0-9]', '', 'g') =
      regexp_replace(LOWER(TRIM(p.location)), '[^a-z0-9]', '', 'g')
      OR LOWER(p.location) LIKE '%' || LOWER(s.name) || '%'
  );

UPDATE products p
SET taluk_id = (
    SELECT id FROM taluks WHERE is_active = true ORDER BY name, id LIMIT 1
)
WHERE p.taluk_id IS NULL;

ALTER TABLE products
    ALTER COLUMN taluk_id SET NOT NULL;

ALTER TABLE products
    ADD CONSTRAINT fk_products_taluk
        FOREIGN KEY (taluk_id)
            REFERENCES taluks (id);

CREATE INDEX idx_products_taluk_id
    ON products (taluk_id);

ALTER TABLE products
    DROP COLUMN location;