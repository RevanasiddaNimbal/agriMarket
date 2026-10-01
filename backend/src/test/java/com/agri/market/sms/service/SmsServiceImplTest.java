package com.agri.market.sms.service;

import com.agri.market.sms.client.SmsProviderClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
@DisplayName("SmsServiceImpl")
class SmsServiceImplTest {

    @Mock
    private SmsProviderClient smsProviderClient;

    @InjectMocks
    private SmsServiceImpl smsService;

    @Test
    void shouldExecuteSendOtpWithoutErrors() {
        assertDoesNotThrow(() -> smsService.sendOtp("9876543210"));
    }

    @Test
    void shouldExecuteVerifyOtpWithoutErrors() {
        assertDoesNotThrow(() -> smsService.verifyOtp("9876543210", "123456"));
    }

    @Test
    void shouldExecuteResendOtpWithoutErrors() {
        assertDoesNotThrow(() -> smsService.resendOtp("9876543210"));
    }
}
