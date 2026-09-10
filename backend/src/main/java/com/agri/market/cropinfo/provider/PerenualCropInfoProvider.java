package com.agri.market.cropinfo.provider;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.cropinfo.config.CropInfoProperties;
import com.agri.market.cropinfo.model.PerenualPlantResponse;
import com.agri.market.cropinfo.model.PerenualPlantSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PerenualCropInfoProvider implements CropInfoProvider {

    private static final int MAX_RESULTS = 50;

    private final RestClient perenualRestClient;
    private final CropInfoProperties properties;

    @Override
    public List<PerenualPlantResponse> searchCrops(String query) {

        log.info(
                "Searching crop information from Perenual for query: {}",
                query
        );

        try {
            ResponseEntity<PerenualPlantSearchResponse> response =
                    perenualRestClient.get()
                            .uri(uriBuilder -> {
                                var builder = uriBuilder
                                        .path("/species-list")
                                        .queryParam("key", properties.getApiKey())
                                        .queryParam("page", 1)
                                        .queryParam("per_page", MAX_RESULTS);

                                if (query != null && !query.isBlank()) {
                                    builder.queryParam("q", query);
                                }

                                return builder.build();
                            })
                            .retrieve()
                            .toEntity(PerenualPlantSearchResponse.class);

            PerenualPlantSearchResponse body = response.getBody();

            if (body == null
                    || body.getData() == null
                    || body.getData().isEmpty()) {

                log.warn(
                        "Perenual returned no crop information for query: {}",
                        query
                );

                return Collections.emptyList();
            }

            List<PerenualPlantResponse> crops =
                    body.getData()
                            .stream()
                            .filter(this::isValidCrop)
                            .limit(MAX_RESULTS)
                            .toList();

            log.info(
                    "Perenual returned {} valid crop results for query: {}",
                    crops.size(),
                    query
            );

            return crops;

        } catch (Exception exception) {
            log.error(
                    "Failed to search crop information from Perenual for query: {}",
                    query,
                    exception
            );

            throw new BusinessException(ErrorCode.EXTERNAL_SERVICE_ERROR);
        }
    }

    private boolean isValidCrop(PerenualPlantResponse crop) {
        return crop != null
                && crop.getId() != null
                && crop.getCommon_name() != null
                && !crop.getCommon_name().isBlank();
    }
}