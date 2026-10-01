package com.agri.market.payment.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.payment.dto.PaymentRequestDto;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.dto.RefundResponseDto;
import com.agri.market.payment.entity.PaymentMethod;
import com.agri.market.payment.entity.PaymentStatus;
import com.agri.market.payment.service.PaymentService;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController")
class PaymentControllerTest {

    private static final String BASE_URL = "/api/v1/payments";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = UserTestFactory.activeUser();

        final HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders
                .standaloneSetup(paymentController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("processPayment")
    class ProcessPaymentTests {

        @Test
        void shouldProcessPaymentSuccessfully() throws Exception {
            final PaymentRequestDto request = new PaymentRequestDto();
            request.setPaymentMethod(PaymentMethod.UPI);

            final PaymentResponseDto responseDto = PaymentResponseDto.builder()
                    .id("pay-1")
                    .orderId("order-1")
                    .amount(new BigDecimal("150.00"))
                    .status(PaymentStatus.SUCCESS)
                    .build();

            given(paymentService.processPayment(eq("order-1"), eq(testUser.getId()), any(PaymentRequestDto.class)))
                    .willReturn(responseDto);

            mockMvc.perform(post(BASE_URL + "/orders/{orderId}", "order-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("pay-1"))
                    .andExpect(jsonPath("$.status").value(PaymentStatus.SUCCESS.name()));
        }
    }

    @Nested
    @DisplayName("getPayment")
    class GetPaymentTests {

        @Test
        void shouldGetPaymentForOrder() throws Exception {
            final PaymentResponseDto responseDto = PaymentResponseDto.builder()
                    .id("pay-1")
                    .orderId("order-1")
                    .build();

            given(paymentService.getPayment("order-1", testUser.getId())).willReturn(responseDto);

            mockMvc.perform(get(BASE_URL + "/orders/{orderId}", "order-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("pay-1"));
        }
    }

    @Nested
    @DisplayName("refundPayment")
    class RefundPaymentTests {

        @Test
        void shouldRefundPaymentSuccessfully() throws Exception {
            final RefundResponseDto responseDto = RefundResponseDto.builder()
                    .paymentId("pay-1")
                    .orderId("order-1")
                    .status(PaymentStatus.REFUNDED)
                    .build();

            given(paymentService.refundPayment("order-1", testUser.getId())).willReturn(responseDto);

            mockMvc.perform(post(BASE_URL + "/orders/{orderId}/refund", "order-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value("pay-1"))
                    .andExpect(jsonPath("$.status").value(PaymentStatus.REFUNDED.name()));
        }
    }
}
