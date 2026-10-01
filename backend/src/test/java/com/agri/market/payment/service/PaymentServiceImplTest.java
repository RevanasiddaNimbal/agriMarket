package com.agri.market.payment.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.service.DeliveryService;
import com.agri.market.email.service.EmailService;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.payment.dto.PaymentRequestDto;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.dto.RefundResponseDto;
import com.agri.market.payment.entity.Payment;
import com.agri.market.payment.entity.PaymentMethod;
import com.agri.market.payment.entity.PaymentStatus;
import com.agri.market.payment.entity.PaymentTransaction;
import com.agri.market.payment.mapper.PaymentMapper;
import com.agri.market.payment.provider.PaymentProvider;
import com.agri.market.payment.provider.PaymentProviderFactory;
import com.agri.market.payment.provider.PaymentProviderResponse;
import com.agri.market.payment.repository.PaymentRepository;
import com.agri.market.payment.repository.PaymentTransactionRepository;
import com.agri.market.product.entity.Product;
import com.agri.market.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentServiceImpl")
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private PaymentProviderFactory paymentProviderFactory;

    @Mock
    private DeliveryService deliveryService;

    @Mock
    private EmailService emailService;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private PaymentProvider paymentProvider;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Nested
    @DisplayName("processPayment")
    class ProcessPaymentTests {

        @Test
        void shouldProcessPaymentSuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).email("user@mail.com").build();
            final User farmer = User.builder().id("farmer-1").email("farmer@mail.com").build();
            final Product product = Product.builder().id("prod-1").farmer(farmer).build();
            final OrderItem item = OrderItem.builder().product(product).quantity(new BigDecimal("2.00")).unitPrice(new BigDecimal("100.00")).build();

            final Order order = Order.builder()
                    .user(user)
                    .status(OrderStatus.PENDING_PAYMENT)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final Inventory inventory = Inventory.builder()
                    .totalQuantity(new BigDecimal("10.00"))
                    .reservedQuantity(new BigDecimal("2.00"))
                    .build();

            final PaymentRequestDto request = new PaymentRequestDto();
            request.setPaymentMethod(PaymentMethod.UPI);

            final PaymentProviderResponse providerResponse = PaymentProviderResponse.builder()
                    .successful(true)
                    .provider("MOCK")
                    .providerPaymentId("mock-pay-123")
                    .providerTransactionId("mock-tx-123")
                    .build();

            final Payment savedPayment = Payment.builder().order(order).build();
            savedPayment.setId("pay-1");
            final PaymentResponseDto responseDto = PaymentResponseDto.builder().id("pay-1").status(PaymentStatus.SUCCESS).build();

            given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
            given(paymentRepository.existsByOrderId(orderId)).willReturn(false);
            given(paymentProviderFactory.getProvider()).willReturn(paymentProvider);
            given(paymentProvider.processPayment(orderId, new BigDecimal("200.00"), PaymentMethod.UPI)).willReturn(providerResponse);
            given(paymentRepository.save(any(Payment.class))).willReturn(savedPayment);
            given(inventoryRepository.findByProductIdForUpdate("prod-1")).willReturn(Optional.of(inventory));
            given(paymentMapper.toResponseDto(savedPayment)).willReturn(responseDto);

            final PaymentResponseDto result = paymentService.processPayment(orderId, userId, request);

            assertThat(result).isSameAs(responseDto);
            assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("8.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("0.00");

            then(deliveryService).should().createDelivery(order);
            then(emailService).should().sendOrderConfirmationEmail(user.getEmail(), orderId, "200.00");
        }

        @Test
        void shouldHandlePaymentFailureAndReleaseReservation() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).build();
            final Product product = Product.builder().id("prod-1").build();
            final OrderItem item = OrderItem.builder().product(product).quantity(new BigDecimal("2.00")).unitPrice(new BigDecimal("100.00")).build();

            final Order order = Order.builder()
                    .user(user)
                    .status(OrderStatus.PENDING_PAYMENT)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final Inventory inventory = Inventory.builder()
                    .totalQuantity(new BigDecimal("10.00"))
                    .reservedQuantity(new BigDecimal("2.00"))
                    .build();

            final PaymentRequestDto request = new PaymentRequestDto();
            request.setPaymentMethod(PaymentMethod.UPI);

            final PaymentProviderResponse providerResponse = PaymentProviderResponse.builder()
                    .successful(false)
                    .provider("MOCK")
                    .build();

            final Payment savedPayment = Payment.builder().order(order).build();
            savedPayment.setId("pay-1");

            given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
            given(paymentRepository.existsByOrderId(orderId)).willReturn(false);
            given(paymentProviderFactory.getProvider()).willReturn(paymentProvider);
            given(paymentProvider.processPayment(orderId, new BigDecimal("200.00"), PaymentMethod.UPI)).willReturn(providerResponse);
            given(paymentRepository.save(any(Payment.class))).willReturn(savedPayment);
            given(inventoryRepository.findByProductIdForUpdate("prod-1")).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> paymentService.processPayment(orderId, userId, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PAYMENT_FAILED);

            assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("10.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("0.00");
        }
    }

    @Nested
    @DisplayName("refundPayment")
    class RefundPaymentTests {

        @Test
        void shouldRefundPaymentSuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).build();
            final Order order = Order.builder().user(user).status(OrderStatus.CANCELLED).build();
            order.setId(orderId);

            final Payment payment = Payment.builder()
                    .order(order)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.SUCCESS)
                    .providerPaymentId("prov-pay-1")
                    .build();
            payment.setId("pay-1");

            final PaymentProviderResponse providerResponse = PaymentProviderResponse.builder()
                    .successful(true)
                    .provider("MOCK")
                    .providerTransactionId("ref-1")
                    .build();

            final RefundResponseDto refundDto = RefundResponseDto.builder().paymentId("pay-1").status(PaymentStatus.REFUNDED).build();

            given(paymentRepository.findByOrderId(orderId)).willReturn(Optional.of(payment));
            given(paymentProviderFactory.getProvider()).willReturn(paymentProvider);
            given(paymentProvider.processRefund("prov-pay-1", payment.getAmount())).willReturn(providerResponse);
            given(paymentRepository.save(payment)).willReturn(payment);
            given(paymentMapper.toRefundResponseDto(payment)).willReturn(refundDto);

            final RefundResponseDto result = paymentService.refundPayment(orderId, userId);

            assertThat(result).isSameAs(refundDto);
            assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        }
    }
}
