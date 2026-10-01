package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.entity.Delivery;
import com.agri.market.delivery.mapper.DeliveryMapper;
import com.agri.market.delivery.repository.DeliveryRepository;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderStatus;
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
@DisplayName("AdminDeliveryServiceImpl")
class AdminDeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private DeliveryMapper deliveryMapper;

    @InjectMocks
    private AdminDeliveryServiceImpl adminDeliveryService;

    @Nested
    @DisplayName("getAllDeliveries and getDelivery")
    class GetDeliveriesTests {

        @Test
        void shouldReturnAllDeliveries() {
            final Delivery delivery = Delivery.builder().id("del-1").build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(deliveryRepository.findAll()).willReturn(List.of(delivery));
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final List<DeliveryResponseDto> result = adminDeliveryService.getAllDeliveries();

            assertThat(result).containsExactly(responseDto);
        }

        @Test
        void shouldReturnDeliveryById() {
            final Delivery delivery = Delivery.builder().id("del-1").build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(deliveryRepository.findById("del-1")).willReturn(Optional.of(delivery));
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final DeliveryResponseDto result = adminDeliveryService.getDelivery("del-1");

            assertThat(result).isSameAs(responseDto);
        }
    }

    @Nested
    @DisplayName("status transitions")
    class StatusTransitionTests {

        @Test
        void shouldMarkAsShippedSuccessfully() {
            final Order order = Order.builder().status(OrderStatus.PROCESSING).build();
            order.setId("o-1");
            final Delivery delivery = Delivery.builder().id("del-1").order(order).build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(deliveryRepository.findById("del-1")).willReturn(Optional.of(delivery));
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final DeliveryResponseDto result = adminDeliveryService.markAsShipped("del-1");

            assertThat(result).isSameAs(responseDto);
            assertThat(order.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        }

        @Test
        void shouldThrowExceptionWhenOrderNotInProcessingWhenMarkingShipped() {
            final Order order = Order.builder().status(OrderStatus.PENDING_PAYMENT).build();
            order.setId("o-1");
            final Delivery delivery = Delivery.builder().id("del-1").order(order).build();

            given(deliveryRepository.findById("del-1")).willReturn(Optional.of(delivery));

            assertThatThrownBy(() -> adminDeliveryService.markAsShipped("del-1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.ORDER_INVALID_STATUS_TRANSITION);
        }

        @Test
        void shouldMarkAsOutForDeliverySuccessfully() {
            final Order order = Order.builder().status(OrderStatus.SHIPPED).build();
            order.setId("o-1");
            final Delivery delivery = Delivery.builder().id("del-1").order(order).build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(deliveryRepository.findById("del-1")).willReturn(Optional.of(delivery));
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final DeliveryResponseDto result = adminDeliveryService.markAsOutForDelivery("del-1");

            assertThat(result).isSameAs(responseDto);
            assertThat(order.getStatus()).isEqualTo(OrderStatus.OUT_FOR_DELIVERY);
        }
    }
}
