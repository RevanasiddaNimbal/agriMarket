package com.agri.market.admin.controller;

import com.agri.market.admin.service.AdminPaymentTransactionService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.payment.dto.PaymentTransactionResponseDto;
import com.agri.market.payment.entity.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminPaymentTransactionController")
class AdminPaymentTransactionControllerTest {

    private static final String BASE_URL = "/api/v1/admin/payment-transactions";

    @Mock
    private AdminPaymentTransactionService adminPaymentTransactionService;

    @InjectMocks
    private AdminPaymentTransactionController adminPaymentTransactionController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminPaymentTransactionController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAllTransactions and getTransactionsByType")
    class GetTransactionsTests {

        @Test
        void shouldReturnAllTransactions() throws Exception {
            final PaymentTransactionResponseDto dto = PaymentTransactionResponseDto.builder()
                    .id("tx-1")
                    .build();

            given(adminPaymentTransactionService.getAllTransactions()).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("tx-1"));
        }

        @Test
        void shouldReturnTransactionsByType() throws Exception {
            final PaymentTransactionResponseDto dto = PaymentTransactionResponseDto.builder()
                    .id("tx-1")
                    .build();

            given(adminPaymentTransactionService.getTransactionsByType(TransactionType.PAYMENT))
                    .willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL + "/type/{type}", "PAYMENT"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("tx-1"));
        }
    }
}
