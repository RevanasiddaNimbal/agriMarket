package com.agri.market.marketprice.mapper;

import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.marketprice.dto.HistoricalMarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.entity.Commodity;
import com.agri.market.marketprice.entity.Market;
import com.agri.market.marketprice.entity.MarketPrice;
import org.springframework.stereotype.Component;

@Component
public class MarketPriceMapper {

    public MarketPriceDto toDto(
            final MarketPrice price
    ) {

        if (price == null) {
            return null;
        }

        final String commodityName = price.getCommodity() != null
                ? price.getCommodity().getName()
                : null;

        final Market marketEntity = price.getMarket();
        final String marketName = marketEntity != null
                ? marketEntity.getName()
                : null;

        final District districtEntity = marketEntity != null
                ? marketEntity.getDistrict()
                : null;
        final String districtName = districtEntity != null
                ? districtEntity.getName()
                : null;

        final State stateEntity = districtEntity != null
                ? districtEntity.getState()
                : null;
        final String stateName = stateEntity != null
                ? stateEntity.getName()
                : null;

        return MarketPriceDto.builder()
                .id(price.getId())
                .commodity(commodityName)
                .variety(price.getVariety())
                .grade(price.getGrade())
                .state(stateName)
                .district(districtName)
                .market(marketName)
                .minimumPrice(price.getMinimumPrice())
                .maximumPrice(price.getMaximumPrice())
                .modalPrice(price.getModalPrice())
                .unit(price.getUnit())
                .currency(price.getCurrency())
                .arrivalDate(price.getArrivalDate())
                .source(price.getSource())
                .build();
    }

    public MarketPrice toEntity(
            final MarketPriceDto dto
    ) {

        if (dto == null) {
            return null;
        }

        final Commodity commodity = dto.getCommodity() != null
                ? Commodity.builder().name(dto.getCommodity()).build()
                : null;

        final State state = dto.getState() != null
                ? State.builder().name(dto.getState()).code("N/A").build()
                : null;

        final District district = dto.getDistrict() != null || state != null
                ? District.builder()
                .name(dto.getDistrict() != null ? dto.getDistrict() : "N/A")
                .code("N/A")
                .state(state)
                .build()
                : null;

        final Market market = dto.getMarket() != null || district != null
                ? Market.builder()
                .name(dto.getMarket() != null ? dto.getMarket() : "N/A")
                .district(district)
                .build()
                : null;

        return toEntity(dto, commodity, market);
    }

    public MarketPrice toEntity(
            final MarketPriceDto dto,
            final Commodity commodity,
            final Market market
    ) {

        if (dto == null) {
            return null;
        }

        return MarketPrice.builder()
                .id(dto.getId())
                .commodity(commodity)
                .variety(dto.getVariety())
                .grade(dto.getGrade())
                .market(market)
                .minimumPrice(dto.getMinimumPrice())
                .maximumPrice(dto.getMaximumPrice())
                .modalPrice(dto.getModalPrice())
                .unit(dto.getUnit())
                .currency(dto.getCurrency())
                .arrivalDate(dto.getArrivalDate())
                .source(dto.getSource())
                .build();
    }

    public HistoricalMarketPriceDto toHistoricalDto(
            final MarketPrice price
    ) {

        if (price == null) {
            return null;
        }

        final String commodityName = price.getCommodity() != null
                ? price.getCommodity().getName()
                : null;

        final Market marketEntity = price.getMarket();
        final String marketName = marketEntity != null
                ? marketEntity.getName()
                : null;

        final District districtEntity = marketEntity != null
                ? marketEntity.getDistrict()
                : null;
        final String districtName = districtEntity != null
                ? districtEntity.getName()
                : null;

        final State stateEntity = districtEntity != null
                ? districtEntity.getState()
                : null;
        final String stateName = stateEntity != null
                ? stateEntity.getName()
                : null;

        return HistoricalMarketPriceDto.builder()
                .date(price.getArrivalDate())
                .commodity(commodityName)
                .state(stateName)
                .district(districtName)
                .market(marketName)
                .modalPrice(price.getModalPrice())
                .unit(price.getUnit())
                .currency(price.getCurrency())
                .build();
    }

    public HistoricalMarketPriceDto toHistoricalDto(
            final MarketPriceDto price
    ) {

        if (price == null) {
            return null;
        }

        return HistoricalMarketPriceDto.builder()
                .date(price.getArrivalDate())
                .commodity(price.getCommodity())
                .state(price.getState())
                .district(price.getDistrict())
                .market(price.getMarket())
                .modalPrice(price.getModalPrice())
                .unit(price.getUnit())
                .currency(price.getCurrency())
                .build();
    }
}