CREATE TABLE crop_info_soil_requirements
(
    crop_info_id VARCHAR(36) NOT NULL,
    requirement  TEXT        NOT NULL,

    CONSTRAINT pk_crop_info_soil_requirements
        PRIMARY KEY (crop_info_id, requirement),

    CONSTRAINT fk_crop_info_soil_requirements_crop
        FOREIGN KEY (crop_info_id)
            REFERENCES crop_info (id)
            ON DELETE CASCADE
);

CREATE TABLE crop_info_sunlight_requirements
(
    crop_info_id VARCHAR(36) NOT NULL,
    requirement  TEXT        NOT NULL,

    CONSTRAINT pk_crop_info_sunlight_requirements
        PRIMARY KEY (crop_info_id, requirement),

    CONSTRAINT fk_crop_info_sunlight_requirements_crop
        FOREIGN KEY (crop_info_id)
            REFERENCES crop_info (id)
            ON DELETE CASCADE
);

CREATE TABLE crop_info_common_pests
(
    crop_info_id VARCHAR(36) NOT NULL,
    pest         TEXT        NOT NULL,

    CONSTRAINT pk_crop_info_common_pests
        PRIMARY KEY (crop_info_id, pest),

    CONSTRAINT fk_crop_info_common_pests_crop
        FOREIGN KEY (crop_info_id)
            REFERENCES crop_info (id)
            ON DELETE CASCADE
);

INSERT INTO crop_info_soil_requirements (crop_info_id, requirement)
SELECT c.id,
       BTRIM(token.value)
FROM crop_info c
         CROSS JOIN LATERAL regexp_split_to_table(
                                                  COALESCE(c.soil_requirements, ''),
    '\s*,\s*'
         ) AS token(value)
WHERE NULLIF(BTRIM(token.value), '') IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO crop_info_sunlight_requirements (crop_info_id, requirement)
SELECT c.id,
       BTRIM(token.value)
FROM crop_info c
         CROSS JOIN LATERAL regexp_split_to_table(
                                                  COALESCE(c.sunlight_requirements, ''),
    '\s*,\s*'
         ) AS token(value)
WHERE NULLIF(BTRIM(token.value), '') IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO crop_info_common_pests (crop_info_id, pest)
SELECT c.id,
       BTRIM(token.value)
FROM crop_info c
         CROSS JOIN LATERAL regexp_split_to_table(
                                                  COALESCE(c.common_pests, ''),
    '\s*,\s*'
         ) AS token(value)
WHERE NULLIF(BTRIM(token.value), '') IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE crop_info
DROP COLUMN soil_requirements,
    DROP COLUMN sunlight_requirements,
    DROP COLUMN common_pests;