package com.agri.market.delivery.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.delivery.dto.DeliveryOtpRequestDto;
import com.agri.market.delivery.dto.DeliveryOtpVerificationRequestDto;
import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.service.DeliveryService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryController")
class DeliveryControllerTest {

    private static final String BASE_URL = "/api/v1/deliveries";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DeliveryService deliveryService;

    @InjectMocks
    private DeliveryController deliveryController;

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
                .standaloneSetup(deliveryController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getDelivery")
    class GetDeliveryTests {

        @Test
        void shouldReturnDeliverySuccessfully() throws Exception {
            final DeliveryResponseDto response = DeliveryResponseDto.builder()
                    .id("del-1")
                    .orderId("order-1")
                    .build();

            given(deliveryService.getDelivery("order-1", testUser.getId())).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/orders/{orderId}", "order-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("del-1"))
                    .andExpect(jsonPath("$.order_id").value("order-1"));
        }
    }

    @Nested
    @DisplayName("generateDeliveryOtp")
    class GenerateDeliveryOtpTests {

        @Test
        void shouldGenerateDeliveryOtp() throws Exception {
            final DeliveryOtpRequestDto request = new DeliveryOtpRequestDto();
            request.setOrderId("order-1");

            mockMvc.perform(post(BASE_URL + "/otp")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNoContent());

            then(deliveryService).should().generateDeliveryOtp(any(DeliveryOtpRequestDto.class), eq(testUser.getId()));
        }
    }

    @Nested
    @DisplayName("verifyDeliveryOtp")
    class VerifyDeliveryOtpTests {

        @Test
        void shouldVerifyDeliveryOtp() throws Exception {
            final DeliveryOtpVerificationRequestDto request = new DeliveryOtpVerificationRequestDto();
            request.setOrderId("order-1");
            request.setOtp("123456");

            final DeliveryResponseDto response = DeliveryResponseDto.builder()
                    .id("del-1")
                    .otpVerified(true)
                    .build();

            given(deliveryService.verifyDeliveryOtp(any(DeliveryOtpVerificationRequestDto.class), eq(testUser.getId())))
                    .willReturn(response);

            mockMvc.perform(post(BASE_URL + "/otp/verify")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.otp_verified").value(true));
        }
    }
}
