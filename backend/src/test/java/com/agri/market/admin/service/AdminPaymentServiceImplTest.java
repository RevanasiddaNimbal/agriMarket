package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.entity.Payment;
import com.agri.market.payment.entity.PaymentStatus;
import com.agri.market.payment.mapper.PaymentMapper;
import com.agri.market.payment.repository.PaymentRepository;
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
@DisplayName("AdminPaymentServiceImpl")
class AdminPaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @InjectMocks
    private AdminPaymentServiceImpl adminPaymentService;

    @Nested
    @DisplayName("getAllPayments and getPayment")
    class GetPaymentsTests {

        @Test
        void shouldReturnAllPayments() {
            final Payment payment = Payment.builder().build();
            payment.setId("pay-1");
            final PaymentResponseDto dto = PaymentResponseDto.builder().id("pay-1").build();

            given(paymentRepository.findAll()).willReturn(List.of(payment));
            given(paymentMapper.toResponseDto(payment)).willReturn(dto);

            final List<PaymentResponseDto> result = adminPaymentService.getAllPayments();

            assertThat(result).containsExactly(dto);
        }

        @Test
        void shouldReturnPaymentById() {
            final Payment payment = Payment.builder().build();
            payment.setId("pay-1");
            final PaymentResponseDto dto = PaymentResponseDto.builder().id("pay-1").build();

            given(paymentRepository.findById("pay-1")).willReturn(Optional.of(payment));
            given(paymentMapper.toResponseDto(payment)).willReturn(dto);

            final PaymentResponseDto result = adminPaymentService.getPayment("pay-1");

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenPaymentNotFound() {
            given(paymentRepository.findById("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> adminPaymentService.getPayment("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PAYMENT_NOT_FOUND);
        }

        @Test
        void shouldReturnPaymentsByStatus() {
            final Payment payment = Payment.builder().status(PaymentStatus.SUCCESS).build();
            payment.setId("pay-1");
            final PaymentResponseDto dto = PaymentResponseDto.builder().id("pay-1").status(PaymentStatus.SUCCESS).build();

            given(paymentRepository.findAllByStatusOrderByCreatedDateDesc(PaymentStatus.SUCCESS)).willReturn(List.of(payment));
            given(paymentMapper.toResponseDto(payment)).willReturn(dto);

            final List<PaymentResponseDto> result = adminPaymentService.getPaymentsByStatus(PaymentStatus.SUCCESS);

            assertThat(result).containsExactly(dto);
        }
    }
}
