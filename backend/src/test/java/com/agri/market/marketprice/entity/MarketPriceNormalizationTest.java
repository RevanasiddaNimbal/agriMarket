package com.agri.market.marketprice.entity;

import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.mapper.MarketPriceMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MarketPriceNormalizationTest")
class MarketPriceNormalizationTest {

    private final MarketPriceMapper mapper = new MarketPriceMapper();

    @Test
    void shouldVerifyCommodityCanBeReferencedByMultipleMarketPrices() {
        final Commodity commodity = Commodity.builder().id("c-100").name("Onion").build();
        final State state = State.builder().id("s-100").name("Karnataka").code("KA").build();
        final District district = District.builder().id("d-100").name("Bengaluru").code("KA-BLR").state(state).build();
        final Market market1 = Market.builder().id("m-100").name("Yeshwanthpur").district(district).build();
        final Market market2 = Market.builder().id("m-101").name("KRMarket").district(district).build();

        final MarketPrice price1 = MarketPrice.builder()
                .id("mp-100")
                .commodity(commodity)
                .market(market1)
                .modalPrice(new BigDecimal("2000"))
                .arrivalDate(LocalDate.now())
                .build();

        final MarketPrice price2 = MarketPrice.builder()
                .id("mp-101")
                .commodity(commodity)
                .market(market2)
                .modalPrice(new BigDecimal("2100"))
                .arrivalDate(LocalDate.now())
                .build();

        assertThat(price1.getCommodity()).isEqualTo(commodity);
        assertThat(price2.getCommodity()).isEqualTo(commodity);
        assertThat(price1.getCommodity().getName()).isEqualTo("Onion");
    }

    @Test
    void shouldVerifyMarketBelongsToDistrictAndDistrictToState() {
        final State state = State.builder().id("s-200").name("Karnataka").code("KA").build();
        final District district = District.builder().id("d-200").name("Vijayapura").code("KA-VJP").state(state).build();
        final Market market = Market.builder().id("m-200").name("Vijayapura Mandi").district(district).build();

        assertThat(market.getDistrict()).isEqualTo(district);
        assertThat(district.getState()).isEqualTo(state);
        assertThat(market.getDistrict().getState().getName()).isEqualTo("Karnataka");
    }

    @Test
    void shouldDeriveStateAndDistrictThroughMarketPriceRelationships() {
        final State state = State.builder().id("s-300").name("Maharashtra").code("MH").build();
        final District district = District.builder().id("d-300").name("Nashik").code("MH-NSK").state(state).build();
        final Market market = Market.builder().id("m-300").name("Lasalgaon").district(district).build();
        final Commodity commodity = Commodity.builder().id("c-300").name("Tomato").build();

        final MarketPrice price = MarketPrice.builder()
                .id("mp-300")
                .commodity(commodity)
                .market(market)
                .modalPrice(new BigDecimal("1500"))
                .arrivalDate(LocalDate.now())
                .build();

        final MarketPriceDto dto = mapper.toDto(price);

        assertThat(dto.getCommodity()).isEqualTo("Tomato");
        assertThat(dto.getMarket()).isEqualTo("Lasalgaon");
        assertThat(dto.getDistrict()).isEqualTo("Nashik");
        assertThat(dto.getState()).isEqualTo("Maharashtra");
    }
}
