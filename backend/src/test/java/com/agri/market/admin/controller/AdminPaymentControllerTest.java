package com.agri.market.admin.controller;

import com.agri.market.admin.service.AdminPaymentService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.entity.PaymentStatus;
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
@DisplayName("AdminPaymentController")
class AdminPaymentControllerTest {

    private static final String BASE_URL = "/api/v1/admin/payments";

    @Mock
    private AdminPaymentService adminPaymentService;

    @InjectMocks
    private AdminPaymentController adminPaymentController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminPaymentController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAllPayments and getPayment")
    class GetPaymentsTests {

        @Test
        void shouldReturnAllPayments() throws Exception {
            final PaymentResponseDto dto = PaymentResponseDto.builder()
                    .id("pay-1")
                    .build();

            given(adminPaymentService.getAllPayments()).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("pay-1"));
        }

        @Test
        void shouldReturnPaymentById() throws Exception {
            final PaymentResponseDto dto = PaymentResponseDto.builder()
                    .id("pay-1")
                    .build();

            given(adminPaymentService.getPayment("pay-1")).willReturn(dto);

            mockMvc.perform(get(BASE_URL + "/{paymentId}", "pay-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("pay-1"));
        }

        @Test
        void shouldReturnPaymentsByStatus() throws Exception {
            final PaymentResponseDto dto = PaymentResponseDto.builder()
                    .id("pay-1")
                    .status(PaymentStatus.SUCCESS)
                    .build();

            given(adminPaymentService.getPaymentsByStatus(PaymentStatus.SUCCESS)).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL + "/status/{status}", "SUCCESS"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("pay-1"));
        }
    }
}
