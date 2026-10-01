package com.agri.market.payment.mapper;

import com.agri.market.order.entity.Order;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.dto.RefundResponseDto;
import com.agri.market.payment.entity.Payment;
import com.agri.market.payment.entity.PaymentMethod;
import com.agri.market.payment.entity.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("PaymentMapper")
class PaymentMapperTest {

    private PaymentMapper paymentMapper;

    @BeforeEach
    void setUp() {
        paymentMapper = new PaymentMapper();
    }

    @Test
    void shouldMapPaymentToResponseDto() {
        final Order order = Order.builder().build();
        order.setId("order-10");
        final LocalDateTime now = LocalDateTime.now();

        final Payment payment = Payment.builder()
                .order(order)
                .amount(new BigDecimal("999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.SUCCESS)
                .provider("MOCK")
                .providerPaymentId("prov-pay-1")
                .paidAt(now)
                .refundedAt(null)
                .build();
        payment.setId("pay-1");

        final PaymentResponseDto dto = paymentMapper.toResponseDto(payment);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("pay-1");
        assertThat(dto.getOrderId()).isEqualTo("order-10");
        assertThat(dto.getAmount()).isEqualByComparingTo("999.00");
        assertThat(dto.getPaymentMethod()).isEqualTo(PaymentMethod.UPI);
        assertThat(dto.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(dto.getPaidAt()).isEqualTo(now);
    }

    @Test
    void shouldMapPaymentToRefundResponseDto() {
        final Order order = Order.builder().build();
        order.setId("order-10");
        final LocalDateTime now = LocalDateTime.now();

        final Payment payment = Payment.builder()
                .order(order)
                .amount(new BigDecimal("999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.REFUNDED)
                .provider("MOCK")
                .refundedAt(now)
                .build();
        payment.setId("pay-1");

        final RefundResponseDto dto = paymentMapper.toRefundResponseDto(payment);

        assertThat(dto).isNotNull();
        assertThat(dto.getPaymentId()).isEqualTo("pay-1");
        assertThat(dto.getOrderId()).isEqualTo("order-10");
        assertThat(dto.getAmount()).isEqualByComparingTo("999.00");
        assertThat(dto.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        assertThat(dto.getRefundedAt()).isEqualTo(now);
    }
}
