package com.agri.market.cropinfo.mapper;

import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.entity.CropInfo;
import com.agri.market.cropinfo.model.PerenualPlantResponse;
import com.agri.market.cropinfo.provider.AgricultureCropDataProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CropInfoMapper {

    private final AgricultureCropDataProvider agricultureCropDataProvider;

    public CropInfoResponseDto toResponseDto(CropInfo entity) {
        if (entity == null) {
            return null;
        }

        return CropInfoResponseDto.builder()
                .id(entity.getId())
                .cropName(entity.getCropName())
                .scientificName(entity.getScientificName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .lifeCycle(entity.getLifeCycle())
                .growthStages(entity.getGrowthStages())
                .sowingInfo(entity.getSowingInfo())
                .growingDuration(entity.getGrowingDuration())
                .harvestingInfo(entity.getHarvestingInfo())
                .soilRequirements(entity.getSoilRequirements())
                .waterRequirements(entity.getWaterRequirements())
                .sunlightRequirements(entity.getSunlightRequirements())
                .temperatureRequirements(entity.getTemperatureRequirements())
                .commonPests(entity.getCommonPests())
                .commonDiseases(entity.getCommonDiseases())
                .uses(entity.getUses())
                .build();
    }

    public CropSummaryDto toSummaryDto(CropInfo entity) {
        if (entity == null) {
            return null;
        }

        return CropSummaryDto.builder()
                .id(entity.getId())
                .cropName(entity.getCropName())
                .scientificName(entity.getScientificName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    public CropInfo toEntity(PerenualPlantResponse response) {
        if (response == null) {
            return null;
        }

        AgricultureCropDataProvider.AgricultureData localData =
                agricultureCropDataProvider.find(response.getCommon_name());

        String cropName = StringUtils.hasText(response.getCommon_name())
                ? response.getCommon_name().trim()
                : "Unknown Crop";

        CropInfo entity = CropInfo.builder()
                .cropName(cropName)
                .scientificName(firstAvailable(
                        null,
                        getScientificName(response),
                        "Scientific name not available."
                ))
                .description(firstAvailable(
                        null,
                        response.getDescription(),
                        buildGenericDescription(cropName)
                ))
                .imageUrl(getImageUrl(response))
                .lifeCycle(firstAvailable(
                        null,
                        response.getCycle(),
                        "Life cycle varies by crop variety and growing conditions."
                ))
                .growthStages(firstAvailable(
                        null,
                        localData.growthStages(),
                        "Germination → Vegetative Growth → Flowering → Maturity → Harvest"
                ))
                .sowingInfo(firstAvailable(
                        null,
                        localData.sowingInfo(),
                        "Sow healthy planting material in well-prepared soil during the suitable local growing season."
                ))
                .growingDuration(firstAvailable(
                        null,
                        localData.growingDuration(),
                        "Growing duration varies by crop variety and growing conditions."
                ))
                .harvestingInfo(firstAvailable(
                        null,
                        buildHarvestingInfo(response),
                        localData.harvestingInfo(),
                        "Harvest at the recommended maturity stage according to the crop and intended use."
                ))
                .soilRequirements(firstAvailable(
                        null,
                        joinValues(response.getSoil()),
                        "Soil requirements vary by crop variety and local growing conditions."
                ))
                .waterRequirements(firstAvailable(
                        null,
                        response.getWatering(),
                        "Water requirements vary by crop, growth stage and local conditions."
                ))
                .sunlightRequirements(firstAvailable(
                        null,
                        joinValues(response.getSunlight()),
                        "Sunlight requirements vary by crop variety and growing conditions."
                ))
                .temperatureRequirements(firstAvailable(
                        null,
                        localData.temperatureRequirements(),
                        "Suitable temperature varies by crop variety and growing conditions."
                ))
                .commonPests(firstAvailable(
                        null,
                        joinValues(response.getPest_susceptibility()),
                        "Pest occurrence varies by crop, variety, season and local conditions."
                ))
                .commonDiseases(firstAvailable(
                        null,
                        localData.commonDiseases(),
                        "Disease occurrence varies with crop, variety, weather and growing conditions."
                ))
                .uses(firstAvailable(
                        null,
                        localData.uses(),
                        "Uses vary depending on the crop, variety and agricultural purpose."
                ))
                .build();

        return entity;
    }

    public void updateEntity(CropInfo entity, PerenualPlantResponse response) {
        if (entity == null || response == null) {
            return;
        }

        AgricultureCropDataProvider.AgricultureData localData =
                agricultureCropDataProvider.find(response.getCommon_name());

        String cropName = StringUtils.hasText(entity.getCropName())
                ? entity.getCropName().trim()
                : StringUtils.hasText(response.getCommon_name())
                ? response.getCommon_name().trim()
                : "Unknown Crop";

        entity.setCropName(cropName);

        entity.setScientificName(firstAvailable(
                entity.getScientificName(),
                getScientificName(response),
                "Scientific name not available."
        ));

        entity.setDescription(firstAvailable(
                entity.getDescription(),
                response.getDescription(),
                buildGenericDescription(cropName)
        ));

        entity.setImageUrl(firstAvailable(
                entity.getImageUrl(),
                getImageUrl(response),
                null
        ));

        entity.setLifeCycle(firstAvailable(
                entity.getLifeCycle(),
                response.getCycle(),
                "Life cycle varies by crop variety and growing conditions."
        ));

        entity.setGrowthStages(firstAvailable(
                entity.getGrowthStages(),
                localData.growthStages(),
                "Germination → Vegetative Growth → Flowering → Maturity → Harvest"
        ));

        entity.setSowingInfo(firstAvailable(
                entity.getSowingInfo(),
                localData.sowingInfo(),
                "Sow healthy planting material in well-prepared soil during the suitable local growing season."
        ));

        entity.setGrowingDuration(firstAvailable(
                entity.getGrowingDuration(),
                localData.growingDuration(),
                "Growing duration varies by crop variety and growing conditions."
        ));

        entity.setHarvestingInfo(firstAvailable(
                entity.getHarvestingInfo(),
                buildHarvestingInfo(response),
                localData.harvestingInfo(),
                "Harvest at the recommended maturity stage according to the crop and intended use."
        ));

        entity.setSoilRequirements(firstAvailable(
                entity.getSoilRequirements(),
                joinValues(response.getSoil()),
                "Soil requirements vary by crop variety and local growing conditions."
        ));

        entity.setWaterRequirements(firstAvailable(
                entity.getWaterRequirements(),
                response.getWatering(),
                "Water requirements vary by crop, growth stage and local conditions."
        ));

        entity.setSunlightRequirements(firstAvailable(
                entity.getSunlightRequirements(),
                joinValues(response.getSunlight()),
                "Sunlight requirements vary by crop variety and growing conditions."
        ));

        entity.setTemperatureRequirements(firstAvailable(
                entity.getTemperatureRequirements(),
                localData.temperatureRequirements(),
                "Suitable temperature varies by crop variety and growing conditions."
        ));

        entity.setCommonPests(firstAvailable(
                entity.getCommonPests(),
                joinValues(response.getPest_susceptibility()),
                "Pest occurrence varies by crop, variety, season and local conditions."
        ));

        entity.setCommonDiseases(firstAvailable(
                entity.getCommonDiseases(),
                localData.commonDiseases(),
                "Disease occurrence varies with crop, variety, weather and growing conditions."
        ));

        entity.setUses(firstAvailable(
                entity.getUses(),
                localData.uses(),
                "Uses vary depending on the crop, variety and agricultural purpose."
        ));
    }

    private String firstAvailable(String existing, String newValue, String fallback) {
        return firstAvailable(existing, newValue, null, fallback);
    }

    private String firstAvailable(
            String existing,
            String firstValue,
            String secondValue,
            String fallback
    ) {
        if (StringUtils.hasText(existing)) {
            return existing;
        }

        if (StringUtils.hasText(firstValue)) {
            return firstValue;
        }

        if (StringUtils.hasText(secondValue)) {
            return secondValue;
        }

        return fallback;
    }

    private String buildGenericDescription(String cropName) {
        return cropName + " is a plant that can be grown and managed according to suitable local soil, climate, water and cultivation conditions.";
    }

    private String getScientificName(PerenualPlantResponse response) {
        if (response.getScientific_name() == null
                || response.getScientific_name().isEmpty()) {
            return null;
        }

        return response.getScientific_name()
                .stream()
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);
    }

    private String getImageUrl(PerenualPlantResponse response) {
        if (response.getDefault_image() == null) {
            return null;
        }

        if (StringUtils.hasText(response.getDefault_image().getOriginal_url())) {
            return response.getDefault_image().getOriginal_url();
        }

        if (StringUtils.hasText(response.getDefault_image().getRegular_url())) {
            return response.getDefault_image().getRegular_url();
        }

        if (StringUtils.hasText(response.getDefault_image().getMedium_url())) {
            return response.getDefault_image().getMedium_url();
        }

        if (StringUtils.hasText(response.getDefault_image().getSmall_url())) {
            return response.getDefault_image().getSmall_url();
        }

        return response.getDefault_image().getThumbnail();
    }

    private String joinValues(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        String result = values.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .distinct()
                .reduce((first, second) -> first + ", " + second)
                .orElse(null);

        return StringUtils.hasText(result) ? result : null;
    }

    private String buildHarvestingInfo(PerenualPlantResponse response) {
        String season = response.getHarvest_season();
        String method = response.getHarvest_method();

        if (StringUtils.hasText(season) && StringUtils.hasText(method)) {
            return "Harvest season: " + season + ". Harvest method: " + method + ".";
        }

        if (StringUtils.hasText(season)) {
            return "Harvest season: " + season + ".";
        }

        if (StringUtils.hasText(method)) {
            return "Harvest method: " + method + ".";
        }

        return null;
    }
}