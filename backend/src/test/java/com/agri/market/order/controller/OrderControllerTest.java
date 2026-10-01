package com.agri.market.order.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.dto.OrderTrackingResponseDto;
import com.agri.market.order.dto.PlaceOrderRequestDto;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.service.OrderService;
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
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderController")
class OrderControllerTest {

    private static final String BASE_URL = "/api/v1/orders";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

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
                .standaloneSetup(orderController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("placeOrder")
    class PlaceOrderTests {

        @Test
        void shouldPlaceOrderSuccessfully() throws Exception {
            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId("p1");
            request.setAddressId("addr-1");
            request.setQuantity(new BigDecimal("10.00"));

            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .status(OrderStatus.PENDING_PAYMENT)
                    .build();

            given(orderService.placeOrder(any(PlaceOrderRequestDto.class), eq(testUser.getId())))
                    .willReturn(responseDto);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("order-1"))
                    .andExpect(jsonPath("$.status").value(OrderStatus.PENDING_PAYMENT.name()));
        }
    }

    @Nested
    @DisplayName("getMyOrders and getOrder")
    class GetOrderTests {

        @Test
        void shouldReturnMyOrders() throws Exception {
            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .build();

            given(orderService.getMyOrders(testUser.getId())).willReturn(List.of(responseDto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("order-1"));
        }

        @Test
        void shouldReturnOrderById() throws Exception {
            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .build();

            given(orderService.getOrder("order-1", testUser.getId())).willReturn(responseDto);

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
            request.setStatus(OrderStatus.PROCESSING);

            final OrderResponseDto responseDto = OrderResponseDto.builder()
                    .id("order-1")
                    .status(OrderStatus.PROCESSING)
                    .build();

            given(orderService.updateOrderStatus(eq("order-1"), eq(testUser.getId()), any(OrderStatusUpdateRequestDto.class)))
                    .willReturn(responseDto);

            mockMvc.perform(patch(BASE_URL + "/{orderId}/status", "order-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(OrderStatus.PROCESSING.name()));
        }
    }

    @Nested
    @DisplayName("cancelOrder")
    class CancelOrderTests {

        @Test
        void shouldCancelOrderSuccessfully() throws Exception {
            mockMvc.perform(post(BASE_URL + "/{orderId}/cancel", "order-1"))
                    .andExpect(status().isNoContent());

            then(orderService).should().cancelOrder("order-1", testUser.getId());
        }
    }

    @Nested
    @DisplayName("trackMyOrder")
    class TrackMyOrderTests {

        @Test
        void shouldTrackOrderSuccessfully() throws Exception {
            final OrderTrackingResponseDto response = OrderTrackingResponseDto.builder()
                    .orderId("order-1")
                    .status(OrderStatus.PROCESSING)
                    .build();

            given(orderService.trackMyOrder("order-1", testUser.getId())).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/{orderId}/track", "order-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.order_id").value("order-1"))
                    .andExpect(jsonPath("$.status").value(OrderStatus.PROCESSING.name()));
        }
    }
}
