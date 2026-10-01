package com.agri.market.admin.controller;

import com.agri.market.admin.service.AdminOrderService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.entity.OrderStatus;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminOrderController")
class AdminOrderControllerTest {

    private static final String BASE_URL = "/api/v1/admin/orders";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AdminOrderService adminOrderService;

    @InjectMocks
    private AdminOrderController adminOrderController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminOrderController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAllOrders and getOrder")
    class GetOrdersTests {

        @Test
        void shouldReturnAllOrders() throws Exception {
            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .build();

            given(adminOrderService.getAllOrders()).willReturn(List.of(responseDto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("order-1"));
        }

        @Test
        void shouldReturnOrderById() throws Exception {
            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .build();

            given(adminOrderService.getOrder("order-1")).willReturn(responseDto);

            mockMvc.perform(get(BASE_URL + "/{orderId}", "order-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("order-1"));
        }
    }

    @Nested
    @DisplayName("updateOrderStatus")
    class UpdateOrderStatusTests {

        @Test
        void shouldUpdateOrderStatusSuccessfully() throws Exception {
            final OrderStatusUpdateRequestDto request = new OrderStatusUpdateRequestDto();
            request.setStatus(OrderStatus.DELIVERED);

            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .status(OrderStatus.DELIVERED)
                    .build();

            given(adminOrderService.updateOrderStatus(eq("order-1"), any(OrderStatusUpdateRequestDto.class)))
                    .willReturn(responseDto);

            mockMvc.perform(patch(BASE_URL + "/{orderId}/status", "order-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(OrderStatus.DELIVERED.name()));
        }
    }
}
