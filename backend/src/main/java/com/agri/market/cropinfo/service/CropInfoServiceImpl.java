package com.agri.market.cropinfo.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSearchResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.entity.CropInfo;
import com.agri.market.cropinfo.mapper.CropInfoMapper;
import com.agri.market.cropinfo.model.PerenualPlantResponse;
import com.agri.market.cropinfo.provider.CropInfoProvider;
import com.agri.market.cropinfo.repository.CropInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CropInfoServiceImpl implements CropInfoService {

    private static final int MAX_RESULTS = 50;

    private final CropInfoRepository cropInfoRepository;
    private final CropInfoProvider cropInfoProvider;
    private final CropInfoMapper cropInfoMapper;

    @Override
    @Transactional
    public List<CropSummaryDto> getFeaturedCrops() {
        List<CropInfo> existingCrops = cropInfoRepository.findAll();

        if (!existingCrops.isEmpty()) {
            return existingCrops.stream()
                    .limit(MAX_RESULTS)
                    .map(cropInfoMapper::toSummaryDto)
                    .toList();
        }

        log.info("Crop information database is empty, fetching initial crop data");

        List<PerenualPlantResponse> providerCrops =
                cropInfoProvider.searchCrops("");

        if (providerCrops.isEmpty()) {
            return List.of();
        }

        List<CropInfo> storedCrops = storeProviderCrops(providerCrops);

        return storedCrops.stream()
                .limit(MAX_RESULTS)
                .map(cropInfoMapper::toSummaryDto)
                .toList();
    }

    @Override
    @Transactional
    public CropSearchResponseDto searchCrop(String query) {
        if (!StringUtils.hasText(query)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        String normalizedQuery = normalize(query);

        List<CropInfo> storedMatches = findStoredMatches(normalizedQuery);

        if (!storedMatches.isEmpty()) {
            List<CropInfo> ranked = rankStoredCrops(
                    storedMatches,
                    normalizedQuery
            );

            return buildResponse(
                    query,
                    ranked,
                    true,
                    "Crop information found."
            );
        }

        log.info("No crop information found in database for query: {}", query);

        List<PerenualPlantResponse> providerCrops =
                cropInfoProvider.searchCrops(query);

        if (!providerCrops.isEmpty()) {
            List<CropInfo> storedCrops =
                    storeProviderCrops(providerCrops);

            List<CropInfo> ranked =
                    rankStoredCrops(storedCrops, normalizedQuery);

            boolean found = ranked.stream()
                    .anyMatch(crop -> isMatchingCrop(crop, normalizedQuery));

            return buildResponse(
                    query,
                    ranked,
                    found,
                    found
                            ? "Crop information found."
                            : "Related crop information found."
            );
        }

        List<CropInfo> fallbackCrops = cropInfoRepository.findAll()
                .stream()
                .limit(MAX_RESULTS)
                .toList();

        return buildResponse(
                query,
                fallbackCrops,
                false,
                fallbackCrops.isEmpty()
                        ? "No crop information found."
                        : "No exact crop match found. Showing available crop information."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CropInfoResponseDto getCropById(String cropId) {
        CropInfo cropInfo = cropInfoRepository.findById(cropId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        return cropInfoMapper.toResponseDto(cropInfo);
    }

    private List<CropInfo> findStoredMatches(String query) {
        return cropInfoRepository.findAll()
                .stream()
                .filter(crop -> isMatchingCrop(crop, query))
                .toList();
    }

    private List<CropInfo> rankStoredCrops(
            List<CropInfo> crops,
            String query
    ) {
        return crops.stream()
                .sorted(
                        Comparator
                                .comparingInt((CropInfo crop) ->
                                        calculateMatchRank(crop, query))
                                .thenComparing(
                                        crop -> normalize(crop.getCropName()),
                                        Comparator.nullsLast(String::compareTo)
                                )
                )
                .limit(MAX_RESULTS)
                .toList();
    }

    private int calculateMatchRank(
            CropInfo crop,
            String query
    ) {
        String cropName = normalize(crop.getCropName());
        String scientificName = normalize(crop.getScientificName());

        if (cropName.equals(query)) {
            return 0;
        }

        if (cropName.startsWith(query)) {
            return 1;
        }

        if (cropName.contains(query)) {
            return 2;
        }

        if (scientificName.equals(query)) {
            return 3;
        }

        if (scientificName.contains(query)) {
            return 4;
        }

        return 5;
    }

    private boolean isMatchingCrop(
            CropInfo crop,
            String query
    ) {
        String cropName = normalize(crop.getCropName());
        String scientificName = normalize(crop.getScientificName());

        return cropName.contains(query)
                || scientificName.contains(query);
    }

    private List<CropInfo> storeProviderCrops(
            List<PerenualPlantResponse> providerCrops
    ) {
        Map<String, CropInfo> existingByName =
                cropInfoRepository.findAll()
                        .stream()
                        .filter(crop -> StringUtils.hasText(crop.getCropName()))
                        .collect(Collectors.toMap(
                                crop -> normalize(crop.getCropName()),
                                Function.identity(),
                                (first, second) -> first
                        ));

        List<PerenualPlantResponse> uniqueProviderCrops =
                providerCrops.stream()
                        .filter(this::isValidProviderCrop)
                        .collect(Collectors.toMap(
                                crop -> normalize(crop.getCommon_name()),
                                Function.identity(),
                                (first, second) -> first
                        ))
                        .values()
                        .stream()
                        .limit(MAX_RESULTS)
                        .toList();

        List<CropInfo> cropsToSave = uniqueProviderCrops.stream()
                .map(providerCrop -> {
                    String normalizedName =
                            normalize(providerCrop.getCommon_name());

                    CropInfo existing =
                            existingByName.get(normalizedName);

                    if (existing != null) {
                        cropInfoMapper.updateEntity(
                                existing,
                                providerCrop
                        );
                        return existing;
                    }

                    CropInfo newCrop =
                            cropInfoMapper.toEntity(providerCrop);

                    existingByName.put(
                            normalizedName,
                            newCrop
                    );

                    return newCrop;
                })
                .toList();

        return cropInfoRepository.saveAll(cropsToSave);
    }

    private boolean isValidProviderCrop(
            PerenualPlantResponse crop
    ) {
        return crop != null
                && crop.getId() != null
                && StringUtils.hasText(crop.getCommon_name());
    }

    private CropSearchResponseDto buildResponse(
            String query,
            List<CropInfo> crops,
            boolean found,
            String message
    ) {
        List<CropSummaryDto> summaries = crops.stream()
                .limit(MAX_RESULTS)
                .map(cropInfoMapper::toSummaryDto)
                .toList();

        return CropSearchResponseDto.builder()
                .found(found)
                .query(query)
                .crops(summaries)
                .total(summaries.size())
                .message(message)
                .build();
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        return value
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }
}