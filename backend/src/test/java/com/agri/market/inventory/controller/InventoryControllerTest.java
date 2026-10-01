package com.agri.market.inventory.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.dto.InventoryUpdateRequestDto;
import com.agri.market.inventory.dto.StockAdjustmentRequestDto;
import com.agri.market.inventory.service.InventoryService;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryController")
class InventoryControllerTest {

    private static final String BASE_URL = "/api/v1/products";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private InventoryController inventoryController;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = UserTestFactory.activeUser();

        final HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders
                .standaloneSetup(inventoryController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAvailability")
    class GetAvailabilityTests {

        @Test
        void shouldReturnAvailabilitySuccessfully() throws Exception {
            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .availableQuantity(new BigDecimal("100"))
                    .build();

            given(inventoryService.getAvailability("p1")).willReturn(dto);

            mockMvc.perform(get(BASE_URL + "/{productId}/availability", "p1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.product_id").value("p1"))
                    .andExpect(jsonPath("$.available_quantity").value(100));
        }
    }

    @Nested
    @DisplayName("getMyInventory")
    class GetMyInventoryTests {

        @Test
        void shouldReturnMyInventoryList() throws Exception {
            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .build();

            given(inventoryService.getMyInventory(testUser.getId())).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL + "/me/inventory"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].product_id").value("p1"));
        }
    }

    @Nested
    @DisplayName("updateInventory")
    class UpdateInventoryTests {

        @Test
        void shouldUpdateInventoryQuantity() throws Exception {
            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("150.00"));

            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .availableQuantity(new BigDecimal("150.00"))
                    .build();

            given(inventoryService.updateInventory(eq("p1"), eq(testUser.getId()), any(InventoryUpdateRequestDto.class)))
                    .willReturn(dto);

            mockMvc.perform(patch(BASE_URL + "/{productId}/inventory", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.product_id").value("p1"));
        }
    }

    @Nested
    @DisplayName("addStock and removeStock")
    class StockAdjustmentTests {

        @Test
        void shouldAddStockSuccessfully() throws Exception {
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("50.00"));

            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .build();

            given(inventoryService.addStock(eq("p1"), eq(testUser.getId()), any(StockAdjustmentRequestDto.class)))
                    .willReturn(dto);

            mockMvc.perform(post(BASE_URL + "/{productId}/inventory/add", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        void shouldRemoveStockSuccessfully() throws Exception {
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("20.00"));

            final InventoryResponseDto dto = InventoryResponseDto.builder()
                    .productId("p1")
                    .build();

            given(inventoryService.removeStock(eq("p1"), eq(testUser.getId()), any(StockAdjustmentRequestDto.class)))
                    .willReturn(dto);

            mockMvc.perform(post(BASE_URL + "/{productId}/inventory/remove", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }
}
