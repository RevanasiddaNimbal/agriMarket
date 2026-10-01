package com.agri.market.marketprice.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.marketprice.dto.HistoricalMarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceResponseDto;
import com.agri.market.marketprice.dto.MarketPriceTrendDto;
import com.agri.market.marketprice.entity.MarketPrice;
import com.agri.market.marketprice.mapper.MarketPriceMapper;
import com.agri.market.marketprice.provider.MarketPriceProvider;
import com.agri.market.marketprice.repository.MarketPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("MarketPriceServiceImpl")
class MarketPriceServiceImplTest {

    @Mock
    private MarketPriceRepository marketPriceRepository;

    @Mock
    private MarketPriceProvider marketPriceProvider;

    @Mock
    private MarketPriceMapper marketPriceMapper;

    private MarketPriceServiceImpl marketPriceService;

    @BeforeEach
    void setUp() {
        marketPriceService =
                new MarketPriceServiceImpl(
                        marketPriceRepository,
                        List.of(marketPriceProvider),
                        marketPriceMapper
                );
    }

    @Nested
    @DisplayName("getMarketPrices")
    class GetMarketPricesTests {

        @Test
        void shouldReturnLatestPricesFromDbWhenNoFiltersGiven() {
            final MarketPrice price =
                    MarketPrice.builder()
                            .id("mp-1")
                            .commodity("Tomato")
                            .build();

            final MarketPriceDto dto =
                    MarketPriceDto.builder()
                            .id("mp-1")
                            .commodity("Tomato")
                            .build();

            given(
                    marketPriceRepository.findLatestPrices(
                            any(Pageable.class)
                    )
            ).willReturn(
                    List.of(price)
            );

            given(
                    marketPriceMapper.toDto(price)
            ).willReturn(dto);

            final MarketPriceResponseDto result =
                    marketPriceService.getMarketPrices(
                            null,
                            null,
                            null,
                            null,
                            null
                    );

            assertThat(result).isNotNull();
            assertThat(result.getPrices())
                    .containsExactly(dto);

            verify(marketPriceProvider, times(0))
                    .getMarketPrices(
                            any(),
                            any(),
                            any(),
                            any(),
                            any()
                    );
        }

        @Test
        void shouldFetchFromProviderWhenDatabaseHasNoLatestPrices() {
            final MarketPriceDto dto =
                    MarketPriceDto.builder()
                            .id("mp-2")
                            .commodity("Tomato")
                            .state("Karnataka")
                            .district("Vijayapura")
                            .market("Vijayapura")
                            .arrivalDate(LocalDate.of(2026, 9, 29))
                            .minimumPrice(new BigDecimal("1400"))
                            .maximumPrice(new BigDecimal("1700"))
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final MarketPrice entity =
                    MarketPrice.builder()
                            .id("mp-2")
                            .commodity("Tomato")
                            .arrivalDate(LocalDate.of(2026, 9, 29))
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            given(
                    marketPriceRepository.findLatestPrices(
                            any(Pageable.class)
                    )
            ).willReturn(
                    List.of()
            );

            given(
                    marketPriceProvider.getMarketPrices(
                            null,
                            null,
                            null,
                            null,
                            null
                    )
            ).willReturn(
                    List.of(dto)
            );

            given(
                    marketPriceRepository
                            .existsByCommodityAndStateAndDistrictAndMarketAndArrivalDate(
                                    anyString(),
                                    anyString(),
                                    anyString(),
                                    anyString(),
                                    any(LocalDate.class)
                            )
            ).willReturn(false);

            given(
                    marketPriceMapper.toEntity(dto)
            ).willReturn(entity);

            final MarketPriceResponseDto result =
                    marketPriceService.getMarketPrices(
                            null,
                            null,
                            null,
                            null,
                            null
                    );

            assertThat(result).isNotNull();
            assertThat(result.getPrices())
                    .containsExactly(dto);

            verify(marketPriceProvider)
                    .getMarketPrices(
                            null,
                            null,
                            null,
                            null,
                            null
                    );

            verify(marketPriceRepository)
                    .save(entity);
        }

        @Test
        void shouldReturnStoredPricesWhenCommodityIsProvided() {
            final MarketPrice price =
                    MarketPrice.builder()
                            .id("mp-3")
                            .commodity("Onion")
                            .build();

            final MarketPriceDto dto =
                    MarketPriceDto.builder()
                            .id("mp-3")
                            .commodity("Onion")
                            .build();

            given(
                    marketPriceRepository.findByCommodity("Onion")
            ).willReturn(
                    List.of(price)
            );

            given(
                    marketPriceMapper.toDto(price)
            ).willReturn(dto);

            final MarketPriceResponseDto result =
                    marketPriceService.getMarketPrices(
                            "Onion",
                            null,
                            null,
                            null,
                            null
                    );

            assertThat(result).isNotNull();
            assertThat(result.getPrices())
                    .containsExactly(dto);

            verify(marketPriceProvider, times(0))
                    .getMarketPrices(
                            any(),
                            any(),
                            any(),
                            any(),
                            any()
                    );
        }

        @Test
        void shouldFetchFromProviderWhenCommodityIsMissingInDatabase() {
            final LocalDate date =
                    LocalDate.of(2026, 9, 29);

            final MarketPriceDto dto =
                    MarketPriceDto.builder()
                            .id("mp-4")
                            .commodity("Onion")
                            .state("Karnataka")
                            .district("Vijayapura")
                            .market("Vijayapura")
                            .arrivalDate(date)
                            .minimumPrice(new BigDecimal("1200"))
                            .maximumPrice(new BigDecimal("1600"))
                            .modalPrice(new BigDecimal("1400"))
                            .build();

            final MarketPrice entity =
                    MarketPrice.builder()
                            .id("mp-4")
                            .commodity("Onion")
                            .arrivalDate(date)
                            .modalPrice(new BigDecimal("1400"))
                            .build();

            given(
                    marketPriceRepository.findByCommodity("Onion")
            ).willReturn(
                    List.of()
            );

            given(
                    marketPriceProvider.getMarketPrices(
                            "Onion",
                            null,
                            null,
                            null,
                            null
                    )
            ).willReturn(
                    List.of(dto)
            );

            given(
                    marketPriceRepository
                            .existsByCommodityAndStateAndDistrictAndMarketAndArrivalDate(
                                    "Onion",
                                    "Karnataka",
                                    "Vijayapura",
                                    "Vijayapura",
                                    date
                            )
            ).willReturn(false);

            given(
                    marketPriceMapper.toEntity(dto)
            ).willReturn(entity);

            final MarketPriceResponseDto result =
                    marketPriceService.getMarketPrices(
                            "Onion",
                            null,
                            null,
                            null,
                            null
                    );

            assertThat(result).isNotNull();
            assertThat(result.getPrices())
                    .containsExactly(dto);

            verify(marketPriceProvider)
                    .getMarketPrices(
                            "Onion",
                            null,
                            null,
                            null,
                            null
                    );

            verify(marketPriceRepository)
                    .save(entity);
        }

        @Test
        void shouldHandleNullProviderResponse() {
            given(
                    marketPriceRepository.findByCommodity("Potato")
            ).willReturn(
                    List.of()
            );

            given(
                    marketPriceProvider.getMarketPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            null
                    )
            ).willReturn(null);

            given(
                    marketPriceRepository.findLatestPrices(
                            any(Pageable.class)
                    )
            ).willReturn(
                    List.of()
            );

            final MarketPriceResponseDto result =
                    marketPriceService.getMarketPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            null
                    );

            assertThat(result).isNotNull();
            assertThat(result.getPrices()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getHistoricalPrices")
    class GetHistoricalPricesTests {

        @Test
        void shouldReturnHistoricalPricesSuccessfully() {
            final LocalDate date =
                    LocalDate.of(2026, 9, 20);

            final MarketPrice price =
                    MarketPrice.builder()
                            .commodity("Potato")
                            .arrivalDate(date)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final HistoricalMarketPriceDto historicalDto =
                    HistoricalMarketPriceDto.builder()
                            .date(date)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            given(
                    marketPriceRepository.findByCommodityAndDateRange(
                            anyString(),
                            any(LocalDate.class),
                            any(LocalDate.class)
                    )
            ).willReturn(
                    List.of(price)
            );

            given(
                    marketPriceMapper.toHistoricalDto(price)
            ).willReturn(historicalDto);

            final MarketPriceTrendDto result =
                    marketPriceService.getHistoricalPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            date,
                            date
                    );

            assertThat(result).isNotNull();
            assertThat(result.getCommodity())
                    .isEqualTo("Potato");
            assertThat(result.getPrices())
                    .containsExactly(historicalDto);

            verify(marketPriceProvider, times(0))
                    .getMarketPrices(
                            any(),
                            any(),
                            any(),
                            any(),
                            any()
                    );
        }

        @Test
        void shouldFetchMissingHistoricalPricesFromProvider() {
            final LocalDate from =
                    LocalDate.of(2026, 9, 20);

            final LocalDate missingDate =
                    LocalDate.of(2026, 9, 21);

            final MarketPrice storedPrice =
                    MarketPrice.builder()
                            .id("mp-20")
                            .commodity("Potato")
                            .arrivalDate(from)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final MarketPrice fetchedEntity =
                    MarketPrice.builder()
                            .id("mp-21")
                            .commodity("Potato")
                            .arrivalDate(missingDate)
                            .modalPrice(new BigDecimal("1550"))
                            .build();

            final MarketPriceDto fetchedDto =
                    MarketPriceDto.builder()
                            .id("mp-21")
                            .commodity("Potato")
                            .state("Karnataka")
                            .district("Vijayapura")
                            .market("Vijayapura")
                            .arrivalDate(missingDate)
                            .minimumPrice(new BigDecimal("1400"))
                            .maximumPrice(new BigDecimal("1700"))
                            .modalPrice(new BigDecimal("1550"))
                            .build();

            final HistoricalMarketPriceDto firstHistoricalDto =
                    HistoricalMarketPriceDto.builder()
                            .date(from)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final HistoricalMarketPriceDto secondHistoricalDto =
                    HistoricalMarketPriceDto.builder()
                            .date(missingDate)
                            .modalPrice(new BigDecimal("1550"))
                            .build();

            final List<MarketPrice> storedPrices =
                    new ArrayList<>(
                            List.of(storedPrice)
                    );

            given(
                    marketPriceRepository.findByCommodityAndDateRange(
                            eq("Potato"),
                            eq(from),
                            eq(missingDate)
                    )
            ).willAnswer(
                    invocation -> storedPrices
            );

            given(
                    marketPriceRepository.findByCommodityAndDate(
                            eq("Potato"),
                            eq(missingDate)
                    )
            ).willReturn(
                    List.of()
            );

            given(
                    marketPriceProvider.getMarketPrices(
                            eq("Potato"),
                            eq(null),
                            eq(null),
                            eq(null),
                            eq(missingDate)
                    )
            ).willReturn(
                    List.of(fetchedDto)
            );

            given(
                    marketPriceRepository
                            .existsByCommodityAndStateAndDistrictAndMarketAndArrivalDate(
                                    eq("Potato"),
                                    eq("Karnataka"),
                                    eq("Vijayapura"),
                                    eq("Vijayapura"),
                                    eq(missingDate)
                            )
            ).willReturn(false);

            given(
                    marketPriceMapper.toEntity(fetchedDto)
            ).willReturn(fetchedEntity);

            given(
                    marketPriceRepository.save(fetchedEntity)
            ).willAnswer(
                    invocation -> {
                        storedPrices.add(fetchedEntity);
                        return fetchedEntity;
                    }
            );

            given(
                    marketPriceMapper.toHistoricalDto(storedPrice)
            ).willReturn(firstHistoricalDto);

            given(
                    marketPriceMapper.toHistoricalDto(fetchedEntity)
            ).willReturn(secondHistoricalDto);

            final MarketPriceTrendDto result =
                    marketPriceService.getHistoricalPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            from,
                            missingDate
                    );

            assertThat(result).isNotNull();
            assertThat(result.getCommodity())
                    .isEqualTo("Potato");
            assertThat(result.getPrices())
                    .containsExactly(
                            firstHistoricalDto,
                            secondHistoricalDto
                    );

            verify(marketPriceProvider)
                    .getMarketPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            missingDate
                    );

            verify(marketPriceRepository)
                    .save(fetchedEntity);
        }

        @Test
        void shouldNotCallProviderWhenAllHistoricalDatesExist() {
            final LocalDate from =
                    LocalDate.of(2026, 9, 20);

            final LocalDate to =
                    LocalDate.of(2026, 9, 21);

            final MarketPrice firstPrice =
                    MarketPrice.builder()
                            .commodity("Potato")
                            .arrivalDate(from)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final MarketPrice secondPrice =
                    MarketPrice.builder()
                            .commodity("Potato")
                            .arrivalDate(to)
                            .modalPrice(new BigDecimal("1550"))
                            .build();

            final HistoricalMarketPriceDto firstDto =
                    HistoricalMarketPriceDto.builder()
                            .date(from)
                            .modalPrice(new BigDecimal("1500"))
                            .build();

            final HistoricalMarketPriceDto secondDto =
                    HistoricalMarketPriceDto.builder()
                            .date(to)
                            .modalPrice(new BigDecimal("1550"))
                            .build();

            given(
                    marketPriceRepository.findByCommodityAndDateRange(
                            eq("Potato"),
                            eq(from),
                            eq(to)
                    )
            ).willReturn(
                    List.of(firstPrice, secondPrice)
            );

            given(
                    marketPriceMapper.toHistoricalDto(firstPrice)
            ).willReturn(firstDto);

            given(
                    marketPriceMapper.toHistoricalDto(secondPrice)
            ).willReturn(secondDto);

            final MarketPriceTrendDto result =
                    marketPriceService.getHistoricalPrices(
                            "Potato",
                            null,
                            null,
                            null,
                            from,
                            to
                    );

            assertThat(result.getPrices())
                    .containsExactly(
                            firstDto,
                            secondDto
                    );

            verify(marketPriceProvider, times(0))
                    .getMarketPrices(
                            any(),
                            any(),
                            any(),
                            any(),
                            any()
                    );
        }

        @Test
        void shouldThrowExceptionWhenCommodityIsBlank() {
            assertThatThrownBy(
                    () ->
                            marketPriceService.getHistoricalPrices(
                                    "",
                                    null,
                                    null,
                                    null,
                                    LocalDate.of(2026, 9, 20),
                                    LocalDate.of(2026, 9, 21)
                            )
            )
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(
                            ErrorCode.MARKET_PRICE_COMMODITY_REQUIRED
                    );
        }

        @Test
        void shouldThrowExceptionWhenDateRangeIsNull() {
            assertThatThrownBy(
                    () ->
                            marketPriceService.getHistoricalPrices(
                                    "Potato",
                                    null,
                                    null,
                                    null,
                                    null,
                                    LocalDate.of(2026, 9, 21)
                            )
            )
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(
                            ErrorCode.MARKET_PRICE_DATE_RANGE_REQUIRED
                    );
        }

        @Test
        void shouldThrowExceptionWhenFromDateIsAfterToDate() {
            final LocalDate from =
                    LocalDate.of(2026, 9, 25);

            final LocalDate to =
                    LocalDate.of(2026, 9, 20);

            assertThatThrownBy(
                    () ->
                            marketPriceService.getHistoricalPrices(
                                    "Potato",
                                    null,
                                    null,
                                    null,
                                    from,
                                    to
                            )
            )
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(
                            ErrorCode.MARKET_PRICE_INVALID_DATE_RANGE
                    );
        }

        @Test
        void shouldThrowExceptionWhenDateRangeIsTooLarge() {
            final LocalDate from =
                    LocalDate.of(2026, 8, 1);

            final LocalDate to =
                    LocalDate.of(2026, 9, 15);

            assertThatThrownBy(
                    () ->
                            marketPriceService.getHistoricalPrices(
                                    "Potato",
                                    null,
                                    null,
                                    null,
                                    from,
                                    to
                            )
            )
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(
                            ErrorCode.MARKET_PRICE_DATE_RANGE_TOO_LARGE
                    );
        }
    }
}