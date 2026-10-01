package com.agri.market.user.service;

import com.agri.market.address.repository.AddressRepository;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.dto.UserDashboardResponseDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserDashboardServiceImpl")
class UserDashboardServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private UserDashboardServiceImpl userDashboardService;

    @Test
    void shouldReturnUserDashboardCounts() {
        final String userId = "user-1";

        given(orderRepository.countByUserId(userId)).willReturn(10L);
        given(orderRepository.countByUserIdAndStatus(userId, OrderStatus.PENDING_PAYMENT)).willReturn(2L);
        given(orderRepository.countByUserIdAndStatus(userId, OrderStatus.DELIVERED)).willReturn(5L);
        given(orderRepository.countByUserIdAndStatusIn(userId, List.of(
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.OUT_FOR_DELIVERY
        ))).willReturn(3L);

        given(productRepository.countByFarmer_Id(userId)).willReturn(4L);
        given(productRepository.countByFarmer_IdAndStatus(userId, ProductStatus.ACTIVE.name())).willReturn(3L);
        given(orderRepository.countCustomerOrdersByFarmerId(userId)).willReturn(8L);
        given(inventoryRepository.countByFarmerId(userId)).willReturn(4L);
        given(addressRepository.countByUserId(userId)).willReturn(2L);

        final UserDashboardResponseDto result = userDashboardService.getDashboard(userId);

        assertThat(result).isNotNull();
        assertThat(result.getBuying().getTotalOrders()).isEqualTo(10L);
        assertThat(result.getBuying().getPendingPaymentOrders()).isEqualTo(2L);
        assertThat(result.getBuying().getDeliveredOrders()).isEqualTo(5L);
        assertThat(result.getBuying().getActiveOrders()).isEqualTo(3L);
        assertThat(result.getSelling().getTotalProducts()).isEqualTo(4L);
        assertThat(result.getSelling().getActiveProducts()).isEqualTo(3L);
        assertThat(result.getSelling().getTotalProductOrders()).isEqualTo(8L);
        assertThat(result.getSelling().getInventoryItems()).isEqualTo(4L);
        assertThat(result.getTotalAddresses()).isEqualTo(2L);
    }
}
