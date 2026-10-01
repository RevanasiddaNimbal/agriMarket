package com.agri.market.order.mapper;

import com.agri.market.order.dto.OrderItemResponseDto;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderAddressSnapshot;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.product.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("OrderMapper")
class OrderMapperTest {

    private OrderMapper orderMapper;

    @BeforeEach
    void setUp() {
        orderMapper = new OrderMapper();
    }

    @Test
    void shouldMapOrderToResponseDto() {
        final Product product = Product.builder()
                .id("prod-1")
                .name("Wheat")
                .unit("KG")
                .build();

        final OrderItem orderItem = OrderItem.builder()
                .product(product)
                .quantity(new BigDecimal("10.00"))
                .unitPrice(new BigDecimal("50.00"))
                .subtotal(new BigDecimal("500.00"))
                .build();
        orderItem.setId("item-1");

        final OrderAddressSnapshot snapshot = OrderAddressSnapshot.builder()
                .build();
        snapshot.setId("snap-1");

        final LocalDateTime now = LocalDateTime.now();

        final Order order = Order.builder()
                .status(OrderStatus.PENDING_PAYMENT)
                .addressSnapshot(snapshot)
                .items(new ArrayList<>(List.of(orderItem)))
                .build();
        order.setId("order-1");
        order.setCreatedDate(now);
        order.setLastModifiedDate(now);

        final OrderResponseDto dto = orderMapper.toResponseDto(order);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("order-1");
        assertThat(dto.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(dto.getTotalAmount()).isEqualByComparingTo("500.00");
        assertThat(dto.getAddressId()).isEqualTo("snap-1");
        assertThat(dto.getItems()).hasSize(1);

        final OrderItemResponseDto itemDto = dto.getItems().get(0);
        assertThat(itemDto.getId()).isEqualTo("item-1");
        assertThat(itemDto.getProductId()).isEqualTo("prod-1");
        assertThat(itemDto.getProductName()).isEqualTo("Wheat");
        assertThat(itemDto.getUnit()).isEqualTo("KG");
        assertThat(itemDto.getQuantity()).isEqualByComparingTo("10.00");
        assertThat(itemDto.getUnitPrice()).isEqualByComparingTo("50.00");
        assertThat(itemDto.getSubtotal()).isEqualByComparingTo("500.00");
    }

    @Test
    void shouldMapOrderItemList() {
        final Product product = Product.builder()
                .id("prod-1")
                .name("Rice")
                .unit("KG")
                .build();

        final OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(new BigDecimal("5"))
                .unitPrice(new BigDecimal("40"))
                .subtotal(new BigDecimal("200"))
                .build();
        item.setId("i-1");

        final List<OrderItemResponseDto> list = orderMapper.toItemResponseDtoList(List.of(item));

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getProductName()).isEqualTo("Rice");
    }

    @Test
    void shouldCalculateOrderTotalFromMultipleOrderItemsUsingHistoricalUnitPrice() {
        final Product product1 = Product.builder().id("prod-1").name("Wheat").price(new BigDecimal("999.00")).unit("KG").build();
        final Product product2 = Product.builder().id("prod-2").name("Rice").price(new BigDecimal("888.00")).unit("KG").build();

        final OrderItem item1 = OrderItem.builder()
                .product(product1)
                .quantity(new BigDecimal("10.00"))
                .unitPrice(new BigDecimal("50.00"))
                .subtotal(new BigDecimal("500.00"))
                .build();

        final OrderItem item2 = OrderItem.builder()
                .product(product2)
                .quantity(new BigDecimal("4.00"))
                .unitPrice(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("100.00"))
                .build();

        final Order order = Order.builder()
                .status(OrderStatus.CONFIRMED)
                .items(new ArrayList<>(List.of(item1, item2)))
                .build();
        order.setId("order-multi");

        final OrderResponseDto dto = orderMapper.toResponseDto(order);

        assertThat(dto.getTotalAmount()).isEqualByComparingTo("600.00");
    }

    @Test
    void shouldReturnZeroTotalWhenOrderHasNoItems() {
        final Order order = Order.builder()
                .status(OrderStatus.PENDING_PAYMENT)
                .items(new ArrayList<>())
                .build();
        order.setId("order-empty");

        final OrderResponseDto dto = orderMapper.toResponseDto(order);

        assertThat(dto.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
