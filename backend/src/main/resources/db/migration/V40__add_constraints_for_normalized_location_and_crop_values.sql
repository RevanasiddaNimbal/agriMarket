ALTER TABLE crop_info_soil_requirements
    ADD CONSTRAINT chk_crop_info_soil_requirements_requirement_not_blank
        CHECK (BTRIM(requirement) <> '');

ALTER TABLE crop_info_sunlight_requirements
    ADD CONSTRAINT chk_crop_info_sunlight_requirements_requirement_not_blank
        CHECK (BTRIM(requirement) <> '');

ALTER TABLE crop_info_common_pests
    ADD CONSTRAINT chk_crop_info_common_pests_pest_not_blank
        CHECK (BTRIM(pest) <> '');

CREATE INDEX idx_crop_info_soil_requirements_requirement
    ON crop_info_soil_requirements (requirement);

CREATE INDEX idx_crop_info_sunlight_requirements_requirement
    ON crop_info_sunlight_requirements (requirement);

CREATE INDEX idx_crop_info_common_pests_pest
    ON crop_info_common_pests (pest);