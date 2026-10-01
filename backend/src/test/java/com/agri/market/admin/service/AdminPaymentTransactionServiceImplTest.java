package com.agri.market.admin.service;

import com.agri.market.payment.dto.PaymentTransactionResponseDto;
import com.agri.market.payment.entity.PaymentTransaction;
import com.agri.market.payment.entity.TransactionType;
import com.agri.market.payment.mapper.PaymentTransactionMapper;
import com.agri.market.payment.repository.PaymentRepository;
import com.agri.market.payment.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminPaymentTransactionServiceImpl")
class AdminPaymentTransactionServiceImplTest {

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentTransactionMapper paymentTransactionMapper;

    @InjectMocks
    private AdminPaymentTransactionServiceImpl adminPaymentTransactionService;

    @Nested
    @DisplayName("getAllTransactions and getTransactionsByType")
    class GetTransactionsTests {

        @Test
        void shouldReturnAllTransactions() {
            final PaymentTransaction tx = PaymentTransaction.builder().build();
            tx.setId("tx-1");
            final PaymentTransactionResponseDto dto = PaymentTransactionResponseDto.builder().id("tx-1").build();

            given(paymentTransactionRepository.findAll()).willReturn(List.of(tx));
            given(paymentTransactionMapper.toResponseDto(tx)).willReturn(dto);

            final List<PaymentTransactionResponseDto> result = adminPaymentTransactionService.getAllTransactions();

            assertThat(result).containsExactly(dto);
        }

        @Test
        void shouldReturnTransactionsByType() {
            final PaymentTransaction tx = PaymentTransaction.builder().transactionType(TransactionType.PAYMENT).build();
            tx.setId("tx-1");
            final PaymentTransactionResponseDto dto = PaymentTransactionResponseDto.builder().id("tx-1").build();

            given(paymentTransactionRepository.findAllByTransactionTypeOrderByCreatedDateDesc(TransactionType.PAYMENT))
                    .willReturn(List.of(tx));
            given(paymentTransactionMapper.toResponseDto(tx)).willReturn(dto);

            final List<PaymentTransactionResponseDto> result = adminPaymentTransactionService.getTransactionsByType(TransactionType.PAYMENT);

            assertThat(result).containsExactly(dto);
        }
    }
}
