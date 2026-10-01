package com.agri.market.admin.controller;

import com.agri.market.admin.service.AdminInventoryService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.dto.InventoryUpdateRequestDto;
import com.agri.market.inventory.dto.StockAdjustmentRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminInventoryController")
class AdminInventoryControllerTest {

    private static final String BASE_URL = "/api/v1/admin/products";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AdminInventoryService adminInventoryService;

    @InjectMocks
    private AdminInventoryController adminInventoryController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminInventoryController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getInventory")
    class GetInventoryTests {

        @Test
        void shouldReturnInventory() throws Exception {
            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .availableQuantity(new BigDecimal("100"))
                    .build();

            given(adminInventoryService.getInventory("p1")).willReturn(dto);

            mockMvc.perform(get(BASE_URL + "/{productId}/inventory", "p1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.product_id").value("p1"));
        }
    }

    @Nested
    @DisplayName("updateInventory")
    class UpdateInventoryTests {

        @Test
        void shouldUpdateInventory() throws Exception {
            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("200"));

            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .build();

            given(adminInventoryService.updateInventory(eq("p1"), any(InventoryUpdateRequestDto.class)))
                    .willReturn(dto);

            mockMvc.perform(patch(BASE_URL + "/{productId}/inventory", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.product_id").value("p1"));
        }
    }

    @Nested
    @DisplayName("stock adjustments")
    class StockAdjustmentTests {

        @Test
        void shouldAddStock() throws Exception {
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("50"));

            final InventoryResponseDto dto = InventoryResponseDto.builder().productId("p1").build();

            given(adminInventoryService.addStock(eq("p1"), any(StockAdjustmentRequestDto.class))).willReturn(dto);

            mockMvc.perform(post(BASE_URL + "/{productId}/inventory/add", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        void shouldRemoveStock() throws Exception {
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("30"));

            final InventoryResponseDto dto = InventoryResponseDto.builder().productId("p1").build();

            given(adminInventoryService.removeStock(eq("p1"), any(StockAdjustmentRequestDto.class))).willReturn(dto);

            mockMvc.perform(post(BASE_URL + "/{productId}/inventory/remove", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }
}
