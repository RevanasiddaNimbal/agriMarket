package com.agri.market.admin.service;

import com.agri.market.admin.dto.AdminDashboardResponseDto;
import com.agri.market.delivery.repository.DeliveryRepository;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.payment.repository.PaymentRepository;
import com.agri.market.payment.repository.PaymentTransactionRepository;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminDashboardServiceImpl")
class AdminDashboardServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @InjectMocks
    private AdminDashboardServiceImpl adminDashboardService;

    @Test
    void shouldReturnAdminDashboardSummary() {
        given(userRepository.count()).willReturn(100L);
        given(productRepository.count()).willReturn(50L);
        given(orderRepository.count()).willReturn(200L);
        given(paymentRepository.count()).willReturn(180L);
        given(paymentTransactionRepository.count()).willReturn(210L);
        given(inventoryRepository.count()).willReturn(50L);
        given(deliveryRepository.count()).willReturn(150L);

        final AdminDashboardResponseDto result = adminDashboardService.getDashboard();

        assertThat(result).isNotNull();
        assertThat(result.getTotalUsers()).isEqualTo(100L);
        assertThat(result.getTotalProducts()).isEqualTo(50L);
        assertThat(result.getTotalOrders()).isEqualTo(200L);
        assertThat(result.getTotalPayments()).isEqualTo(180L);
        assertThat(result.getTotalPaymentTransactions()).isEqualTo(210L);
        assertThat(result.getTotalInventory()).isEqualTo(50L);
        assertThat(result.getTotalDeliveries()).isEqualTo(150L);
    }
}
