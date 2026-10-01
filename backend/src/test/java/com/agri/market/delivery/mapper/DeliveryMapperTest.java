package com.agri.market.delivery.mapper;

import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.entity.Delivery;
import com.agri.market.order.entity.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DeliveryMapper")
class DeliveryMapperTest {

    private DeliveryMapper deliveryMapper;

    @BeforeEach
    void setUp() {
        deliveryMapper = new DeliveryMapper();
    }

    @Test
    void shouldMapDeliveryToResponseDto() {
        final Order order = Order.builder().build();
        order.setId("order-1");
        final LocalDateTime now = LocalDateTime.now();

        final Delivery delivery = Delivery.builder()
                .id("del-1")
                .order(order)
                .otpVerified(true)
                .deliveredAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        final DeliveryResponseDto dto = deliveryMapper.toResponseDto(delivery);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("del-1");
        assertThat(dto.getOrderId()).isEqualTo("order-1");
        assertThat(dto.isOtpVerified()).isTrue();
        assertThat(dto.getDeliveredAt()).isEqualTo(now);
    }
}
