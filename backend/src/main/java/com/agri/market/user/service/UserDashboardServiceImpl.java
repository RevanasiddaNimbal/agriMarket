package com.agri.market.user.service;

import com.agri.market.address.repository.AddressRepository;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.dto.UserDashboardBuyingDto;
import com.agri.market.user.dto.UserDashboardResponseDto;
import com.agri.market.user.dto.UserDashboardSellingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDashboardServiceImpl
        implements UserDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDashboardResponseDto getDashboard(
            final String userId
    ) {

        log.info(
                "Fetching dashboard for user: {}",
                userId
        );

        final long totalOrders =
                orderRepository.countByUserId(userId);

        final long pendingPaymentOrders =
                orderRepository.countByUserIdAndStatus(
                        userId,
                        OrderStatus.PENDING_PAYMENT
                );

        final long deliveredOrders =
                orderRepository.countByUserIdAndStatus(
                        userId,
                        OrderStatus.DELIVERED
                );

        final long activeOrders =
                orderRepository.countByUserIdAndStatusIn(
                        userId,
                        List.of(
                                OrderStatus.CONFIRMED,
                                OrderStatus.PROCESSING,
                                OrderStatus.SHIPPED,
                                OrderStatus.OUT_FOR_DELIVERY
                        )
                );

        final long totalProducts =
                productRepository.countByFarmer_Id(userId);

        final long activeProducts =
                productRepository.countByFarmer_IdAndStatus(
                        userId,
                        ProductStatus.ACTIVE.name()
                );

        final long totalProductOrders =
                orderRepository.countCustomerOrdersByFarmerId(userId);

        final long inventoryItems =
                inventoryRepository.countByFarmerId(userId);

        final long totalAddresses =
                addressRepository.countByUserId(userId);

        final UserDashboardBuyingDto buying =
                UserDashboardBuyingDto.builder()
                        .totalOrders(totalOrders)
                        .pendingPaymentOrders(
                                pendingPaymentOrders
                        )
                        .activeOrders(activeOrders)
                        .deliveredOrders(deliveredOrders)
                        .build();

        final UserDashboardSellingDto selling =
                UserDashboardSellingDto.builder()
                        .totalProducts(totalProducts)
                        .activeProducts(activeProducts)
                        .totalProductOrders(
                                totalProductOrders
                        )
                        .inventoryItems(inventoryItems)
                        .build();

        return UserDashboardResponseDto.builder()
                .buying(buying)
                .selling(selling)
                .totalAddresses(totalAddresses)
                .build();
    }
}