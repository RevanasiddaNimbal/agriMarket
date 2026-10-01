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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("MarketPriceServiceImpl")
class MarketPriceServiceImplTest {

    @Mock
    private MarketPriceRepository marketPriceRepository;

    @Mock
    private List<MarketPriceProvider> marketPriceProviders;

    @Mock
    private MarketPriceMapper marketPriceMapper;

    @InjectMocks
    private MarketPriceServiceImpl marketPriceService;

    @Nested
    @DisplayName("getMarketPrices")
    class GetMarketPricesTests {

        @Test
        void shouldReturnLatestPricesFromDbWhenNoFiltersGiven() {
            final MarketPrice price = MarketPrice.builder()
                    .id("mp-1")
                    .commodity("Tomato")
                    .build();

            final MarketPriceDto dto = MarketPriceDto.builder()
                    .id("mp-1")
                    .commodity("Tomato")
                    .build();

            given(marketPriceRepository.findLatestPrices(any(Pageable.class))).willReturn(List.of(price));
            given(marketPriceMapper.toDto(price)).willReturn(dto);

            final MarketPriceResponseDto result = marketPriceService.getMarketPrices(null, null, null, null, null);

            assertThat(result).isNotNull();
            assertThat(result.getPrices()).containsExactly(dto);
        }

        @Test
        void shouldFilterByCommodityWhenProvided() {
            final MarketPrice price = MarketPrice.builder()
                    .id("mp-2")
                    .commodity("Onion")
                    .build();

            final MarketPriceDto dto = MarketPriceDto.builder()
                    .id("mp-2")
                    .commodity("Onion")
                    .build();

            given(marketPriceRepository.findByCommodity(anyString())).willReturn(List.of(price));
            given(marketPriceMapper.toDto(price)).willReturn(dto);

            final MarketPriceResponseDto result = marketPriceService.getMarketPrices("Onion", null, null, null, null);

            assertThat(result).isNotNull();
            assertThat(result.getPrices()).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("getHistoricalPrices")
    class GetHistoricalPricesTests {

        @Test
        void shouldReturnHistoricalPricesSuccessfully() {
            final LocalDate to = LocalDate.of(2026, 9, 29);
            final LocalDate from = LocalDate.of(2026, 9, 20);

            final MarketPrice price = MarketPrice.builder()
                    .commodity("Potato")
                    .arrivalDate(from)
                    .modalPrice(new BigDecimal("1500"))
                    .build();

            final HistoricalMarketPriceDto historicalDto = HistoricalMarketPriceDto.builder()
                    .date(from)
                    .modalPrice(new BigDecimal("1500"))
                    .build();

            given(marketPriceRepository.findByCommodityAndDateRange(any(), any(), any())).willReturn(List.of(price));
            given(marketPriceMapper.toHistoricalDto(price)).willReturn(historicalDto);

            final MarketPriceTrendDto result = marketPriceService.getHistoricalPrices("Potato", null, null, null, from, to);

            assertThat(result.getCommodity()).isEqualTo("Potato");
            assertThat(result.getPrices()).containsExactly(historicalDto);
        }

        @Test
        void shouldThrowExceptionWhenCommodityIsBlank() {
            assertThatThrownBy(() -> marketPriceService.getHistoricalPrices("", null, null, null, LocalDate.now(), LocalDate.now()))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.MARKET_PRICE_COMMODITY_REQUIRED);
        }
    }
}
