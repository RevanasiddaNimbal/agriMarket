package com.agri.market.marketprice.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.location.repository.DistrictRepository;
import com.agri.market.location.repository.StateRepository;
import com.agri.market.marketprice.dto.HistoricalMarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceResponseDto;
import com.agri.market.marketprice.dto.MarketPriceTrendDto;
import com.agri.market.marketprice.entity.Commodity;
import com.agri.market.marketprice.entity.Market;
import com.agri.market.marketprice.entity.MarketPrice;
import com.agri.market.marketprice.mapper.MarketPriceMapper;
import com.agri.market.marketprice.provider.MarketPriceProvider;
import com.agri.market.marketprice.repository.CommodityRepository;
import com.agri.market.marketprice.repository.MarketPriceRepository;
import com.agri.market.marketprice.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketPriceServiceImpl implements MarketPriceService {

    private static final int MAX_HISTORICAL_DAYS = 30;
    private static final int MAX_API_RESULTS = 50;
    private static final int MAX_DB_RESULTS = 100;

    private static final String SUCCESS_MESSAGE =
            "Market prices retrieved successfully";

    private final MarketPriceRepository marketPriceRepository;
    private final List<MarketPriceProvider> marketPriceProviders;
    private final MarketPriceMapper marketPriceMapper;
    private final CommodityRepository commodityRepository;
    private final MarketRepository marketRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;

    @Override
    public MarketPriceResponseDto getMarketPrices(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate date
    ) {

        log.info(
                "Getting market prices: commodity={}, state={}, district={}, market={}, date={}",
                commodity,
                state,
                district,
                market,
                date
        );

        final boolean noFilters =
                !StringUtils.hasText(commodity)
                        && !StringUtils.hasText(state)
                        && !StringUtils.hasText(district)
                        && !StringUtils.hasText(market)
                        && date == null;

        if (noFilters) {

            log.debug(
                    "No filters supplied. Checking database for latest market prices"
            );

            final List<MarketPrice> latestPrices =
                    getLatestPricesSafely();

            if (!latestPrices.isEmpty()) {

                log.info(
                        "Returning {} latest market price records from database. External API will NOT be called",
                        latestPrices.size()
                );

                return buildEntityResponse(
                        limitEntityResults(latestPrices)
                );
            }

            log.info(
                    "No latest market prices found in database. Calling Mandi provider"
            );

            final List<MarketPriceDto> mandiPrices =
                    fetchFromMandi(
                            null,
                            null,
                            null,
                            null,
                            null
                    );

            saveNewPrices(mandiPrices);

            if (!mandiPrices.isEmpty()) {

                final List<MarketPrice> refreshedLatestPrices =
                        getLatestPricesSafely();

                if (!refreshedLatestPrices.isEmpty()) {

                    log.info(
                            "Returning {} market price records from database after provider sync",
                            refreshedLatestPrices.size()
                    );

                    return buildEntityResponse(
                            limitEntityResults(refreshedLatestPrices)
                    );
                }

                log.info(
                        "Provider returned market prices, but no records are available in database after sync. Returning latest database fallback"
                );
            }

            log.warn(
                    "Mandi provider returned no data. Returning latest database fallback"
            );

            return buildLatestDatabaseFallback();
        }

        log.debug(
                "Checking database before calling external provider"
        );

        final List<MarketPrice> storedPrices =
                findStoredPricesSafely(
                        commodity,
                        state,
                        district,
                        market,
                        date
                );

        if (!storedPrices.isEmpty()) {

            log.info(
                    "Found {} market price records in database. External API will NOT be called",
                    storedPrices.size()
            );

            return buildEntityResponse(
                    limitEntityResults(storedPrices)
            );
        }

        log.info(
                "No matching market price records found in database. Calling Mandi provider"
        );

        final List<MarketPriceDto> mandiPrices =
                fetchFromMandi(
                        commodity,
                        state,
                        district,
                        market,
                        date
                );

        saveNewPrices(mandiPrices);

        if (!mandiPrices.isEmpty()) {

            final List<MarketPrice> refreshedStoredPrices =
                    findStoredPricesSafely(
                            commodity,
                            state,
                            district,
                            market,
                            date
                    );

            if (!refreshedStoredPrices.isEmpty()) {

                log.info(
                        "Returning {} market price records from database after provider sync",
                        refreshedStoredPrices.size()
                );

                return buildEntityResponse(
                        limitEntityResults(refreshedStoredPrices)
                );
            }

            log.info(
                    "Provider returned market prices, but no records are available in database after sync. Returning database fallback"
            );
        }

        log.warn(
                "Mandi provider returned no data. Returning database fallback"
        );

        return buildLatestDatabaseFallback();
    }

    @Override
    public MarketPriceTrendDto getHistoricalPrices(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate fromDate,
            final LocalDate toDate
    ) {

        validateRequiredCommodity(commodity);
        validateDateRange(fromDate, toDate);

        log.info(
                "Getting historical prices: commodity={}, state={}, district={}, market={}, fromDate={}, toDate={}",
                commodity,
                state,
                district,
                market,
                fromDate,
                toDate
        );

        final long requestedDays =
                ChronoUnit.DAYS.between(
                        fromDate,
                        toDate
                ) + 1;

        log.debug(
                "Historical request contains {} requested days",
                requestedDays
        );

        final List<MarketPrice> storedPrices =
                findHistoricalPricesSafely(
                        commodity,
                        state,
                        district,
                        market,
                        fromDate,
                        toDate
                );

        log.info(
                "Database returned {} historical records for requested range",
                storedPrices.size()
        );

        final List<LocalDate> missingDates =
                findMissingDates(
                        storedPrices,
                        fromDate,
                        toDate
                );

        log.debug(
                "Historical database coverage: requestedDays={}, missingDays={}",
                requestedDays,
                missingDates.size()
        );

        if (missingDates.isEmpty()) {

            log.info(
                    "Complete historical data already exists in database. Mandi API will NOT be called"
            );

            return buildHistoricalResponse(
                    commodity,
                    state,
                    district,
                    market,
                    storedPrices
            );
        }

        log.info(
                "Historical data is incomplete. {} dates are missing. Fetching only missing dates from Mandi provider",
                missingDates.size()
        );

        final List<MarketPriceDto> fetchedPrices =
                fetchMissingHistoricalPrices(
                        commodity,
                        state,
                        district,
                        market,
                        missingDates
                );

        if (!fetchedPrices.isEmpty()) {

            log.info(
                    "Fetched {} new historical records from Mandi provider. Saving to database",
                    fetchedPrices.size()
            );

            saveNewPrices(fetchedPrices);

        } else {

            log.warn(
                    "No new historical records were fetched from Mandi provider"
            );
        }

        final List<MarketPrice> finalStoredPrices =
                findHistoricalPricesSafely(
                        commodity,
                        state,
                        district,
                        market,
                        fromDate,
                        toDate
                );

        log.info(
                "Final historical database query returned {} records",
                finalStoredPrices.size()
        );

        if (!finalStoredPrices.isEmpty()) {

            log.info(
                    "Returning historical market prices from database"
            );

            return buildHistoricalResponse(
                    commodity,
                    state,
                    district,
                    market,
                    finalStoredPrices
            );
        }

        log.warn(
                "No historical records available after database/API lookup. Returning latest database fallback"
        );

        return buildLatestHistoricalFallback(
                commodity,
                state,
                district,
                market
        );
    }

    private List<LocalDate> findMissingDates(
            final List<MarketPrice> storedPrices,
            final LocalDate fromDate,
            final LocalDate toDate
    ) {

        final List<LocalDate> missingDates =
                new ArrayList<>();

        final List<LocalDate> storedDates =
                storedPrices == null
                        ? Collections.emptyList()
                        : storedPrices.stream()
                        .filter(price -> price != null)
                        .filter(price -> price.getArrivalDate() != null)
                        .map(MarketPrice::getArrivalDate)
                        .distinct()
                        .toList();

        log.debug(
                "Database contains historical data for {} distinct dates",
                storedDates.size()
        );

        LocalDate currentDate = fromDate;

        while (!currentDate.isAfter(toDate)) {

            if (!storedDates.contains(currentDate)) {

                missingDates.add(currentDate);

                log.debug(
                        "Missing historical date detected: {}",
                        currentDate
                );
            }

            currentDate = currentDate.plusDays(1);
        }

        return missingDates;
    }

    private List<MarketPriceDto> fetchMissingHistoricalPrices(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final List<LocalDate> missingDates
    ) {

        if (missingDates == null || missingDates.isEmpty()) {

            log.debug(
                    "No missing historical dates. External API call skipped"
            );

            return Collections.emptyList();
        }

        final List<MarketPriceDto> results =
                new ArrayList<>();

        for (final LocalDate date : missingDates) {

            log.info(
                    "Processing missing historical date: {}",
                    date
            );

            try {

                final List<MarketPrice> existingForDate =
                        findStoredPricesSafely(
                                commodity,
                                state,
                                district,
                                market,
                                date
                        );

                if (!existingForDate.isEmpty()) {

                    log.debug(
                            "Date {} was populated while processing. API call skipped",
                            date
                    );

                    continue;
                }

                log.info(
                        "Date {} is still missing in database. Calling Mandi provider",
                        date
                );

                final List<MarketPriceDto> dailyPrices =
                        fetchFromMandi(
                                commodity,
                                state,
                                district,
                                market,
                                date
                        );

                if (dailyPrices.isEmpty()) {

                    log.warn(
                            "Mandi provider returned no valid records for date={}",
                            date
                    );

                    continue;
                }

                final List<MarketPriceDto> limitedDailyPrices =
                        dailyPrices.stream()
                                .filter(this::isValidPrice)
                                .limit(MAX_API_RESULTS)
                                .toList();

                log.info(
                        "Mandi provider returned {} valid records for date={}. Processing {} records",
                        dailyPrices.size(),
                        date,
                        limitedDailyPrices.size()
                );

                results.addAll(
                        limitedDailyPrices
                );

            } catch (Exception exception) {

                log.error(
                        "Failed to fetch historical market data for date={}",
                        date,
                        exception
                );
            }
        }

        log.info(
                "Finished fetching missing historical dates. Total new records fetched={}",
                results.size()
        );

        return filterValidPrices(results);
    }

    private List<MarketPriceDto> fetchFromMandi(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate date
    ) {

        if (marketPriceProviders == null
                || marketPriceProviders.isEmpty()) {

            log.warn(
                    "No market price provider is configured"
            );

            return Collections.emptyList();
        }

        for (final MarketPriceProvider provider : marketPriceProviders) {

            if (provider == null) {
                continue;
            }

            final String providerName =
                    provider.getClass().getSimpleName();

            try {

                log.info(
                        "Calling market price provider: {} | commodity={}, state={}, district={}, market={}, date={}",
                        providerName,
                        commodity,
                        state,
                        district,
                        market,
                        date
                );

                final List<MarketPriceDto> prices =
                        provider.getMarketPrices(
                                commodity,
                                state,
                                district,
                                market,
                                date
                        );

                final List<MarketPriceDto> validPrices =
                        filterValidPrices(prices);

                if (!validPrices.isEmpty()) {

                    log.info(
                            "Provider {} returned {} valid market price records",
                            providerName,
                            validPrices.size()
                    );

                    return validPrices;
                }

                log.warn(
                        "Provider {} returned no valid market price records",
                        providerName
                );

            } catch (Exception exception) {

                log.error(
                        "Provider {} failed while fetching market prices",
                        providerName,
                        exception
                );
            }
        }

        return Collections.emptyList();
    }

    private List<MarketPriceDto> filterValidPrices(
            final List<MarketPriceDto> prices
    ) {

        if (prices == null || prices.isEmpty()) {

            log.debug(
                    "Provider returned null or empty market price list"
            );

            return Collections.emptyList();
        }

        return prices.stream()
                .filter(this::isValidPrice)
                .toList();
    }

    private boolean isValidPrice(
            final MarketPriceDto price
    ) {

        return price != null
                && StringUtils.hasText(price.getCommodity())
                && StringUtils.hasText(price.getState())
                && StringUtils.hasText(price.getDistrict())
                && StringUtils.hasText(price.getMarket())
                && price.getArrivalDate() != null
                && price.getMinimumPrice() != null
                && price.getMaximumPrice() != null
                && price.getModalPrice() != null;
    }

    private void saveNewPrices(
            final List<MarketPriceDto> prices
    ) {

        if (prices == null || prices.isEmpty()) {

            log.debug(
                    "No market price records to save"
            );

            return;
        }

        final List<MarketPriceDto> limitedPrices =
                prices.stream()
                        .filter(this::isValidPrice)
                        .limit(MAX_API_RESULTS)
                        .toList();

        log.info(
                "Saving {} market price records out of {} received records. MAX_API_RESULTS={}",
                limitedPrices.size(),
                prices.size(),
                MAX_API_RESULTS
        );

        int savedCount = 0;
        int duplicateCount = 0;
        int failedCount = 0;

        for (final MarketPriceDto dto : limitedPrices) {

            try {

                log.debug(
                        "Checking database before saving: commodity={}, state={}, district={}, market={}, date={}",
                        dto.getCommodity(),
                        dto.getState(),
                        dto.getDistrict(),
                        dto.getMarket(),
                        dto.getArrivalDate()
                );

                final Commodity commodity = resolveOrCreateCommodity(dto.getCommodity());
                final Market market = resolveOrCreateMarket(dto.getState(), dto.getDistrict(), dto.getMarket());

                final boolean exists =
                        marketPriceRepository
                                .existsByCommodityIdAndMarketIdAndArrivalDate(
                                        commodity.getId(),
                                        market.getId(),
                                        dto.getArrivalDate()
                                );

                if (exists) {

                    duplicateCount++;

                    log.debug(
                            "Market price already exists. Skipping insert: commodity={}, state={}, district={}, market={}, date={}",
                            dto.getCommodity(),
                            dto.getState(),
                            dto.getDistrict(),
                            dto.getMarket(),
                            dto.getArrivalDate()
                    );

                    continue;
                }

                marketPriceRepository.save(
                        marketPriceMapper.toEntity(dto, commodity, market)
                );

                savedCount++;

                log.debug(
                        "Market price saved successfully: commodity={}, state={}, district={}, market={}, date={}",
                        dto.getCommodity(),
                        dto.getState(),
                        dto.getDistrict(),
                        dto.getMarket(),
                        dto.getArrivalDate()
                );

            } catch (DataIntegrityViolationException exception) {

                duplicateCount++;

                log.warn(
                        "Market price already exists or violates database constraint: commodity={}, state={}, district={}, market={}, date={}",
                        dto.getCommodity(),
                        dto.getState(),
                        dto.getDistrict(),
                        dto.getMarket(),
                        dto.getArrivalDate()
                );

            } catch (Exception exception) {

                failedCount++;

                log.error(
                        "Failed to save market price record: commodity={}, state={}, district={}, market={}, date={}",
                        dto.getCommodity(),
                        dto.getState(),
                        dto.getDistrict(),
                        dto.getMarket(),
                        dto.getArrivalDate(),
                        exception
                );
            }
        }

        log.info(
                "Market price save completed: received={}, processed={}, saved={}, duplicates={}, failed={}",
                prices.size(),
                limitedPrices.size(),
                savedCount,
                duplicateCount,
                failedCount
        );
    }

    private Commodity resolveOrCreateCommodity(final String name) {
        if (!StringUtils.hasText(name)) {
            throw new BusinessException(ErrorCode.MARKET_PRICE_COMMODITY_REQUIRED);
        }
        final String trimmedName = name.trim();
        return commodityRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> commodityRepository.save(
                        Commodity.builder()
                                .name(trimmedName)
                                .build()
                ));
    }

    private Market resolveOrCreateMarket(
            final String stateName,
            final String districtName,
            final String marketName
    ) {
        final String sName = StringUtils.hasText(stateName) ? stateName.trim() : "Unknown State";
        final String dName = StringUtils.hasText(districtName) ? districtName.trim() : "Unknown District";
        final String mName = StringUtils.hasText(marketName) ? marketName.trim() : "Unknown Market";

        State state = stateRepository.findByNameIgnoreCase(sName)
                .orElseGet(() -> stateRepository.save(
                        State.builder()
                                .name(sName)
                                .code(generateCode(sName, 3))
                                .countryCode("IN")
                                .active(true)
                                .build()
                ));

        District district = districtRepository.findByStateNameAndDistrictName(state.getName(), dName)
                .orElseGet(() -> districtRepository.save(
                        District.builder()
                                .state(state)
                                .name(dName)
                                .code(generateCode(dName, 6))
                                .active(true)
                                .build()
                ));

        return marketRepository.findByDistrictIdAndNameIgnoreCase(district.getId(), mName)
                .orElseGet(() -> marketRepository.save(
                        Market.builder()
                                .district(district)
                                .name(mName)
                                .build()
                ));
    }

    private String generateCode(final String name, final int length) {
        final String cleaned = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (cleaned.isEmpty()) {
            return "UNK";
        }
        return cleaned.length() <= length ? cleaned : cleaned.substring(0, length);
    }

    private List<MarketPrice> findStoredPricesSafely(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate date
    ) {

        try {

            log.debug(
                    "DB query for market prices: commodity={}, state={}, district={}, market={}, date={}",
                    commodity,
                    state,
                    district,
                    market,
                    date
            );

            final List<MarketPrice> result =
                    findStoredPrices(
                            commodity,
                            state,
                            district,
                            market,
                            date
                    );

            log.debug(
                    "DB query returned {} market price records",
                    result.size()
            );

            return result;

        } catch (Exception exception) {

            log.error(
                    "Failed to read market prices from database",
                    exception
            );

            return Collections.emptyList();
        }
    }

    private List<MarketPrice> findStoredPrices(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate date
    ) {

        if (date == null) {

            if (StringUtils.hasText(commodity)
                    && StringUtils.hasText(state)
                    && StringUtils.hasText(district)
                    && StringUtils.hasText(market)) {

                return marketPriceRepository.findByMarket(
                        commodity,
                        state,
                        district,
                        market
                );
            }

            if (StringUtils.hasText(commodity)
                    && StringUtils.hasText(state)
                    && StringUtils.hasText(district)) {

                return marketPriceRepository.findByCommodityStateDistrict(
                        commodity,
                        state,
                        district
                );
            }

            if (StringUtils.hasText(commodity)
                    && StringUtils.hasText(state)) {

                return marketPriceRepository.findByCommodityState(
                        commodity,
                        state
                );
            }

            if (StringUtils.hasText(commodity)) {

                return marketPriceRepository.findByCommodity(
                        commodity
                );
            }

            if (StringUtils.hasText(state)) {

                return marketPriceRepository.findByState(
                        state
                );
            }

            if (StringUtils.hasText(district)) {

                return marketPriceRepository.findByDistrict(
                        district
                );
            }

            if (StringUtils.hasText(market)) {

                return marketPriceRepository.findByMarketOnly(
                        market
                );
            }

            return Collections.emptyList();
        }

        if (StringUtils.hasText(commodity)
                && StringUtils.hasText(state)
                && StringUtils.hasText(district)
                && StringUtils.hasText(market)) {

            return marketPriceRepository.findByMarketAndDate(
                    commodity,
                    state,
                    district,
                    market,
                    date
            );
        }

        if (StringUtils.hasText(commodity)
                && StringUtils.hasText(state)
                && StringUtils.hasText(district)) {

            return marketPriceRepository
                    .findByCommodityStateDistrictAndDate(
                            commodity,
                            state,
                            district,
                            date
                    );
        }

        if (StringUtils.hasText(commodity)
                && StringUtils.hasText(state)) {

            return marketPriceRepository.findByCommodityStateAndDate(
                    commodity,
                    state,
                    date
            );
        }

        if (StringUtils.hasText(commodity)) {

            return marketPriceRepository.findByCommodityAndDate(
                    commodity,
                    date
            );
        }

        if (StringUtils.hasText(state)) {

            return marketPriceRepository.findByStateAndDate(
                    state,
                    date
            );
        }

        if (StringUtils.hasText(district)) {

            return marketPriceRepository.findByDistrictAndDate(
                    district,
                    date
            );
        }

        if (StringUtils.hasText(market)) {

            return marketPriceRepository.findByMarketAndDate(
                    market,
                    date
            );
        }

        return Collections.emptyList();
    }

    private List<MarketPrice> findHistoricalPricesSafely(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate fromDate,
            final LocalDate toDate
    ) {

        try {

            log.debug(
                    "DB historical query: commodity={}, state={}, district={}, market={}, fromDate={}, toDate={}",
                    commodity,
                    state,
                    district,
                    market,
                    fromDate,
                    toDate
            );

            final List<MarketPrice> result =
                    findHistoricalPrices(
                            commodity,
                            state,
                            district,
                            market,
                            fromDate,
                            toDate
                    );

            log.debug(
                    "DB historical query returned {} records",
                    result.size()
            );

            return result;

        } catch (Exception exception) {

            log.error(
                    "Failed to read historical market prices from database",
                    exception
            );

            return Collections.emptyList();
        }
    }

    private List<MarketPrice> findHistoricalPrices(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final LocalDate fromDate,
            final LocalDate toDate
    ) {

        if (StringUtils.hasText(state)
                && StringUtils.hasText(district)
                && StringUtils.hasText(market)) {

            return marketPriceRepository.findByMarketAndDateRange(
                    commodity,
                    state,
                    district,
                    market,
                    fromDate,
                    toDate
            );
        }

        if (StringUtils.hasText(state)
                && StringUtils.hasText(district)) {

            return marketPriceRepository
                    .findByCommodityStateDistrictAndDateRange(
                            commodity,
                            state,
                            district,
                            fromDate,
                            toDate
                    );
        }

        if (StringUtils.hasText(state)) {

            return marketPriceRepository
                    .findByCommodityStateAndDateRange(
                            commodity,
                            state,
                            fromDate,
                            toDate
                    );
        }

        return marketPriceRepository
                .findByCommodityAndDateRange(
                        commodity,
                        fromDate,
                        toDate
                );
    }

    private List<MarketPrice> getLatestPricesSafely() {

        try {

            final Pageable pageable =
                    PageRequest.of(
                            0,
                            MAX_DB_RESULTS
                    );

            log.debug(
                    "Fetching latest {} market price records from database",
                    MAX_DB_RESULTS
            );

            return marketPriceRepository.findLatestPrices(
                    pageable
            );

        } catch (Exception exception) {

            log.error(
                    "Failed to fetch latest market prices from database",
                    exception
            );

            return Collections.emptyList();
        }
    }

    private MarketPriceResponseDto buildLatestDatabaseFallback() {

        log.debug(
                "Building latest database fallback response"
        );

        final List<MarketPrice> latestPrices =
                getLatestPricesSafely();

        return buildEntityResponse(
                latestPrices
        );
    }

    private MarketPriceTrendDto buildLatestHistoricalFallback(
            final String commodity,
            final String state,
            final String district,
            final String market
    ) {

        log.warn(
                "Building latest historical fallback from database"
        );

        final List<MarketPrice> latestPrices =
                getLatestPricesSafely();

        final List<HistoricalMarketPriceDto> history =
                latestPrices.stream()
                        .filter(price -> price != null)
                        .filter(price ->
                                !StringUtils.hasText(commodity)
                                        || (price.getCommodity() != null && commodity.equalsIgnoreCase(
                                        price.getCommodity().getName()
                                ))
                        )
                        .filter(price ->
                                !StringUtils.hasText(state)
                                        || (price.getMarket() != null
                                        && price.getMarket().getDistrict() != null
                                        && price.getMarket().getDistrict().getState() != null
                                        && state.equalsIgnoreCase(
                                        price.getMarket().getDistrict().getState().getName()
                                ))
                        )
                        .filter(price ->
                                !StringUtils.hasText(district)
                                        || (price.getMarket() != null
                                        && price.getMarket().getDistrict() != null
                                        && district.equalsIgnoreCase(
                                        price.getMarket().getDistrict().getName()
                                ))
                        )
                        .filter(price ->
                                !StringUtils.hasText(market)
                                        || (price.getMarket() != null && market.equalsIgnoreCase(
                                        price.getMarket().getName()
                                ))
                        )
                        .filter(price ->
                                price.getArrivalDate() != null
                        )
                        .map(marketPriceMapper::toHistoricalDto)
                        .sorted(
                                Comparator.comparing(
                                        HistoricalMarketPriceDto::getDate
                                )
                        )
                        .toList();

        return MarketPriceTrendDto.builder()
                .commodity(commodity)
                .state(state)
                .district(district)
                .market(market)
                .prices(history)
                .build();
    }

    private MarketPriceResponseDto buildEntityResponse(
            final List<MarketPrice> prices
    ) {

        return MarketPriceResponseDto.builder()
                .message(SUCCESS_MESSAGE)
                .prices(
                        prices == null
                                ? Collections.emptyList()
                                : prices.stream()
                                .filter(price -> price != null)
                                .map(marketPriceMapper::toDto)
                                .toList()
                )
                .build();
    }

    private MarketPriceResponseDto buildDtoResponse(
            final List<MarketPriceDto> prices
    ) {

        return MarketPriceResponseDto.builder()
                .message(SUCCESS_MESSAGE)
                .prices(
                        prices == null
                                ? Collections.emptyList()
                                : prices
                )
                .build();
    }

    private MarketPriceTrendDto buildHistoricalResponse(
            final String commodity,
            final String state,
            final String district,
            final String market,
            final List<MarketPrice> prices
    ) {

        final List<HistoricalMarketPriceDto> history =
                prices == null
                        ? Collections.emptyList()
                        : prices.stream()
                        .filter(price -> price != null)
                        .filter(price ->
                                price.getArrivalDate() != null
                        )
                        .map(marketPriceMapper::toHistoricalDto)
                        .sorted(
                                Comparator.comparing(
                                        HistoricalMarketPriceDto::getDate
                                )
                        )
                        .toList();

        log.debug(
                "Building historical response with {} records",
                history.size()
        );

        return MarketPriceTrendDto.builder()
                .commodity(commodity)
                .state(state)
                .district(district)
                .market(market)
                .prices(history)
                .build();
    }

    private List<MarketPrice> limitEntityResults(
            final List<MarketPrice> prices
    ) {

        if (prices == null || prices.isEmpty()) {
            return Collections.emptyList();
        }

        return prices.stream()
                .limit(MAX_DB_RESULTS)
                .toList();
    }

    private List<MarketPriceDto> limitDtoResults(
            final List<MarketPriceDto> prices
    ) {

        if (prices == null || prices.isEmpty()) {
            return Collections.emptyList();
        }

        return prices.stream()
                .limit(MAX_DB_RESULTS)
                .toList();
    }

    private void validateRequiredCommodity(
            final String commodity
    ) {

        if (!StringUtils.hasText(commodity)) {

            throw new BusinessException(
                    ErrorCode.MARKET_PRICE_COMMODITY_REQUIRED
            );
        }
    }

    private void validateDateRange(
            final LocalDate fromDate,
            final LocalDate toDate
    ) {

        if (fromDate == null || toDate == null) {

            throw new BusinessException(
                    ErrorCode.MARKET_PRICE_DATE_RANGE_REQUIRED
            );
        }

        if (fromDate.isAfter(toDate)) {

            throw new BusinessException(
                    ErrorCode.MARKET_PRICE_INVALID_DATE_RANGE
            );
        }

        final long days =
                ChronoUnit.DAYS.between(
                        fromDate,
                        toDate
                ) + 1;

        if (days > MAX_HISTORICAL_DAYS) {

            throw new BusinessException(
                    ErrorCode.MARKET_PRICE_DATE_RANGE_TOO_LARGE
            );
        }
    }
}