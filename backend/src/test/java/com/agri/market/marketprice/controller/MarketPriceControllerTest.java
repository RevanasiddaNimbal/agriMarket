package com.agri.market.marketprice.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.marketprice.dto.HistoricalMarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceDto;
import com.agri.market.marketprice.dto.MarketPriceResponseDto;
import com.agri.market.marketprice.dto.MarketPriceTrendDto;
import com.agri.market.marketprice.service.MarketPriceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("MarketPriceController")
class MarketPriceControllerTest {

    private static final String BASE_URL = "/api/v1/market-prices";

    @Mock
    private MarketPriceService marketPriceService;

    @InjectMocks
    private MarketPriceController marketPriceController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(marketPriceController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getMarketPrices")
    class GetMarketPricesTests {

        @Test
        void shouldReturnMarketPricesSuccessfully() throws Exception {
            final MarketPriceDto dto = MarketPriceDto.builder()
                    .commodity("Tomato")
                    .modalPrice(new BigDecimal("1200"))
                    .build();

            final MarketPriceResponseDto response = MarketPriceResponseDto.builder()
                    .message("Success")
                    .prices(List.of(dto))
                    .build();

            given(marketPriceService.getMarketPrices(eq("Tomato"), any(), any(), any(), any()))
                    .willReturn(response);

            mockMvc.perform(get(BASE_URL).param("commodity", "Tomato"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.prices[0].commodity").value("Tomato"));
        }
    }

    @Nested
    @DisplayName("getHistoricalPrices")
    class GetHistoricalPricesTests {

        @Test
        void shouldReturnHistoricalPricesSuccessfully() throws Exception {
            final HistoricalMarketPriceDto priceDto = HistoricalMarketPriceDto.builder()
                    .date(LocalDate.of(2026, 9, 28))
                    .modalPrice(new BigDecimal("1500"))
                    .build();

            final MarketPriceTrendDto trendDto = MarketPriceTrendDto.builder()
                    .commodity("Potato")
                    .prices(List.of(priceDto))
                    .build();

            given(marketPriceService.getHistoricalPrices(eq("Potato"), any(), any(), any(), any(), any()))
                    .willReturn(trendDto);

            mockMvc.perform(get(BASE_URL + "/history")
                            .param("commodity", "Potato")
                            .param("fromDate", "2026-09-01")
                            .param("toDate", "2026-09-28"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.commodity").value("Potato"))
                    .andExpect(jsonPath("$.prices[0].modal_price").value(1500));
        }
    }
}
