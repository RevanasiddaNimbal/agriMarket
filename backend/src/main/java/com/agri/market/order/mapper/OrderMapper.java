package com.agri.market.order.mapper;

import com.agri.market.order.dto.OrderItemResponseDto;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    public OrderResponseDto toResponseDto(
            final Order order
    ) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .addressId(
                        order.getAddressSnapshot() == null
                                ? null
                                : order.getAddressSnapshot().getId()
                )
                .items(
                        order.getItems()
                                .stream()
                                .map(this::toItemResponseDto)
                                .toList()
                )
                .createdDate(order.getCreatedDate())
                .lastModifiedDate(order.getLastModifiedDate())
                .build();
    }

    public OrderItemResponseDto toItemResponseDto(
            final OrderItem orderItem
    ) {
        return OrderItemResponseDto.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .subtotal(orderItem.getSubtotal())
                .unit(orderItem.getProduct().getUnit())
                .build();
    }

    public List<OrderItemResponseDto> toItemResponseDtoList(
            final List<OrderItem> orderItems
    ) {
        return orderItems.stream()
                .map(this::toItemResponseDto)
                .toList();
    }
}