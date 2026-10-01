package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.mapper.OrderMapper;
import com.agri.market.order.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminOrderServiceImpl")
class AdminOrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private AdminOrderServiceImpl adminOrderService;

    @Nested
    @DisplayName("getAllOrders and getOrder")
    class GetOrdersTests {

        @Test
        void shouldReturnAllOrders() {
            final Order order = Order.builder().build();
            order.setId("order-1");
            final OrderResponseDto responseDto = OrderResponseDto.builder().id("order-1").build();

            given(orderRepository.findAll()).willReturn(List.of(order));
            given(orderMapper.toResponseDto(order)).willReturn(responseDto);

            final List<OrderResponseDto> result = adminOrderService.getAllOrders();

            assertThat(result).containsExactly(responseDto);
        }

        @Test
        void shouldReturnOrderById() {
            final Order order = Order.builder().build();
            order.setId("order-1");
            final OrderResponseDto responseDto = OrderResponseDto.builder().id("order-1").build();

            given(orderRepository.findById("order-1")).willReturn(Optional.of(order));
            given(orderMapper.toResponseDto(order)).willReturn(responseDto);

            final OrderResponseDto result = adminOrderService.getOrder("order-1");

            assertThat(result).isSameAs(responseDto);
        }

        @Test
        void shouldThrowExceptionWhenOrderNotFound() {
            given(orderRepository.findById("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> adminOrderService.getOrder("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.ORDER_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("updateOrderStatus")
    class UpdateOrderStatusTests {

        @Test
        void shouldUpdateOrderStatusSuccessfully() {
            final Order order = Order.builder().status(OrderStatus.CONFIRMED).build();
            order.setId("order-1");
            final OrderStatusUpdateRequestDto request = new OrderStatusUpdateRequestDto();
            request.setStatus(OrderStatus.PROCESSING);

            final OrderResponseDto responseDto = OrderResponseDto.builder().id("order-1").status(OrderStatus.PROCESSING).build();

            given(orderRepository.findById("order-1")).willReturn(Optional.of(order));
            given(orderRepository.save(order)).willReturn(order);
            given(orderMapper.toResponseDto(order)).willReturn(responseDto);

            final OrderResponseDto result = adminOrderService.updateOrderStatus("order-1", request);

            assertThat(result).isSameAs(responseDto);
            assertThat(order.getStatus()).isEqualTo(OrderStatus.PROCESSING);
        }
    }
}
