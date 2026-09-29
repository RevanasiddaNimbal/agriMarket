package com.agri.market.order.service;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.dto.OrderTrackingResponseDto;
import com.agri.market.order.dto.PlaceOrderRequestDto;

import java.util.List;

public interface OrderService {

    OrderResponseDto getOrder(
            String orderId,
            String userId
    );

    AddressResponseDto getOrderAddress(
            String orderId,
            String userId
    );

    List<OrderResponseDto> getMyOrders(
            String userId
    );


    OrderResponseDto updateOrderStatus(
            String orderId,
            String userId,
            OrderStatusUpdateRequestDto request
    );

    OrderResponseDto placeOrder(
            PlaceOrderRequestDto request,
            String userId
    );

    OrderTrackingResponseDto trackMyOrder(
            String orderId,
            String userId
    );

    void cancelOrder(
            String orderId,
            String userId
    );
}