package com.agri.market.marketprice.mapper;

import com.agri.market.marketprice.dto.HistoricalMarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.entity.MarketPrice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MarketPriceMapper")
class MarketPriceMapperTest {

    private MarketPriceMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MarketPriceMapper();
    }

    @Test
    void shouldMapEntityToDto() {
        final LocalDate date = LocalDate.of(2026, 9, 29);
        final MarketPrice entity = MarketPrice.builder()
                .id("mp-1")
                .commodity("Onion")
                .state("Maharashtra")
                .market("Lasalgaon")
                .modalPrice(new BigDecimal("2500"))
                .arrivalDate(date)
                .build();

        final MarketPriceDto dto = mapper.toDto(entity);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("mp-1");
        assertThat(dto.getCommodity()).isEqualTo("Onion");
        assertThat(dto.getState()).isEqualTo("Maharashtra");
        assertThat(dto.getMarket()).isEqualTo("Lasalgaon");
        assertThat(dto.getModalPrice()).isEqualByComparingTo("2500");
    }

    @Test
    void shouldMapDtoToEntity() {
        final LocalDate date = LocalDate.of(2026, 9, 29);
        final MarketPriceDto dto = MarketPriceDto.builder()
                .commodity("Tomato")
                .state("Karnataka")
                .market("Kolar")
                .modalPrice(new BigDecimal("1200"))
                .arrivalDate(date)
                .build();

        final MarketPrice entity = mapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getCommodity()).isEqualTo("Tomato");
        assertThat(entity.getState()).isEqualTo("Karnataka");
        assertThat(entity.getMarket()).isEqualTo("Kolar");
        assertThat(entity.getModalPrice()).isEqualByComparingTo("1200");
    }

    @Test
    void shouldMapEntityToHistoricalDto() {
        final LocalDate date = LocalDate.of(2026, 9, 29);
        final MarketPrice entity = MarketPrice.builder()
                .arrivalDate(date)
                .commodity("Tomato")
                .state("Karnataka")
                .district("Kolar")
                .market("Kolar")
                .modalPrice(new BigDecimal("1200"))
                .build();

        final HistoricalMarketPriceDto historicalDto = mapper.toHistoricalDto(entity);

        assertThat(historicalDto).isNotNull();
        assertThat(historicalDto.getDate()).isEqualTo(date);
        assertThat(historicalDto.getCommodity()).isEqualTo("Tomato");
        assertThat(historicalDto.getModalPrice()).isEqualByComparingTo("1200");
    }

    @Test
    void shouldReturnNullWhenInputsAreNull() {
        assertThat(mapper.toDto(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
        assertThat(mapper.toHistoricalDto((MarketPrice) null)).isNull();
    }
}
