package com.agri.market.user.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.support.*;
import com.agri.market.user.dto.*;
import com.agri.market.user.entity.User;
import com.agri.market.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController")
class UserControllerTest {

    private static final String USER_EMAIL =
            "revanasidda@mail.com";

    private static final String BASE_URL =
            "/api/v1/users/me";

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        final LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .setControllerAdvice(
                        new ApplicationExceptionHandler()
                )
                .setValidator(validator)
                .build();
    }

    @AfterEach
    void tearDown() {

        org.springframework.security.core.context.SecurityContextHolder
                .clearContext();
    }

    private UsernamePasswordAuthenticationToken authentication(
            final User user
    ) {

        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
    }

    private User authenticatedUser() {

        return UserTestFactory.activeUser();
    }

    // ============================================================
    // GET CURRENT USER PROFILE
    // ============================================================

    @Nested
    @DisplayName("getCurrentUserProfile")
    class GetCurrentUserProfileTests {

        @Test
        void shouldReturnCurrentUserProfile()
                throws Exception {

            final User user =
                    authenticatedUser();

            final UserProfileResponseDto response =
                    UserProfileResponseDto.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .emailVerified(user.isEmailVerified())
                            .phoneVerified(user.isPhoneVerified())
                            .profilePictureUrl(
                                    user.getProfilePictureUrl()
                            )
                            .addresses(List.of())
                            .build();

            when(userService.getCurrentUserProfile(
                    USER_EMAIL
            )).thenReturn(response);

            mockMvc.perform(
                            get(BASE_URL + "/profile")
                                    .principal(
                                            authentication(user)
                                    )
                    )
                    .andExpect(status().isOk())
                    .andExpect(
                            jsonPath("$.id")
                                    .value(user.getId())
                    )
                    .andExpect(
                            jsonPath("$.fullName")
                                    .value(user.getFullName())
                    )
                    .andExpect(
                            jsonPath("$.email")
                                    .value(user.getEmail())
                    )
                    .andExpect(
                            jsonPath("$.phoneNumber")
                                    .value(user.getPhoneNumber())
                    )
                    .andExpect(
                            jsonPath("$.emailVerified")
                                    .value(user.isEmailVerified())
                    )
                    .andExpect(
                            jsonPath("$.phoneVerified")
                                    .value(user.isPhoneVerified())
                    )
                    .andExpect(
                            jsonPath("$.profilePictureUrl")
                                    .value(
                                            user.getProfilePictureUrl()
                                    )
                    )
                    .andExpect(
                            jsonPath("$.addresses")
                                    .isArray()
                    );

            verify(userService)
                    .getCurrentUserProfile(USER_EMAIL);
        }

        @Test
        void shouldReturnEmptyAddressListWhenUserHasNoAddresses()
                throws Exception {

            final User user =
                    authenticatedUser();

            final UserProfileResponseDto response =
                    UserProfileResponseDto.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .emailVerified(user.isEmailVerified())
                            .phoneVerified(user.isPhoneVerified())
                            .profilePictureUrl(
                                    user.getProfilePictureUrl()
                            )
                            .addresses(List.of())
                            .build();

            when(userService.getCurrentUserProfile(
                    USER_EMAIL
            )).thenReturn(response);

            mockMvc.perform(
                            get(BASE_URL + "/profile")
                                    .principal(
                                            authentication(user)
                                    )
                    )
                    .andExpect(status().isOk())
                    .andExpect(
                            jsonPath("$.addresses")
                                    .isArray()
                    )
                    .andExpect(
                            jsonPath("$.addresses")
                                    .isEmpty()
                    );
        }
    }

    // ============================================================
    // UPDATE FULL NAME
    // ============================================================

    @Nested
    @DisplayName("updateFullName")
    class UpdateFullNameTests {

        @Test
        void shouldUpdateFullNameForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            final UpdateFullNameRequestDto request =
                    UpdateFullNameRequestTestFactory.validRequest();

            mockMvc.perform(
                            patch(
                                    BASE_URL
                                            + "/profile/full-name"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .updateFullName(
                            any(
                                    UpdateFullNameRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }

        @Test
        void shouldRejectInvalidFullNamePayload()
                throws Exception {

            final User user =
                    authenticatedUser();

            final UpdateFullNameRequestDto request =
                    UpdateFullNameRequestTestFactory
                            .invalidRequest();

            mockMvc.perform(
                            patch(
                                    BASE_URL
                                            + "/profile/full-name"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isBadRequest()
                    );

            verifyNoInteractions(userService);
        }
    }

    // ============================================================
    // UPDATE PROFILE PICTURE
    // ============================================================

    @Nested
    @DisplayName("updateProfilePicture")
    class UpdateProfilePictureTests {

        @Test
        void shouldUpdateProfilePictureForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            mockMvc.perform(
                            multipart(
                                    BASE_URL
                                            + "/profile-picture"
                            )
                                    .file(
                                            "profilePicture",
                                            "test-image-content".getBytes()
                                    )
                                    .principal(
                                            authentication(user)
                                    )
                                    .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                    })
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .updateProfilePicture(
                            any(
                                    UpdateProfilePictureRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }

        @Test
        void shouldRejectInvalidProfilePicturePayload()
                throws Exception {

            final User user =
                    authenticatedUser();

            mockMvc.perform(
                            multipart(
                                    BASE_URL
                                            + "/profile-picture"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                    })
                    )
                    .andExpect(
                            status().isBadRequest()
                    );

            verifyNoInteractions(userService);
        }
    }


    // ============================================================
    // SEND PHONE OTP
    // ============================================================

    @Nested
    @DisplayName("sendPhoneOtp")
    class SendPhoneOtpTests {

        @Test
        void shouldSendPhoneOtpForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            final SendPhoneOtpRequestDto request =
                    SendPhoneOtpRequestTestFactory
                            .validRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/send-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .sendPhoneOtp(
                            any(
                                    SendPhoneOtpRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }

        @Test
        void shouldRejectInvalidPhoneOtpRequest()
                throws Exception {

            final User user =
                    authenticatedUser();

            final SendPhoneOtpRequestDto request =
                    SendPhoneOtpRequestTestFactory
                            .invalidRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/send-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isBadRequest()
                    );

            verifyNoInteractions(userService);
        }
    }

    // ============================================================
    // VERIFY PHONE OTP
    // ============================================================

    @Nested
    @DisplayName("verifyPhoneOtp")
    class VerifyPhoneOtpTests {

        @Test
        void shouldVerifyPhoneOtpForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            final VerifyPhoneOtpRequestDto request =
                    VerifyPhoneOtpRequestTestFactory
                            .validRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/verify-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .verifyPhoneOtp(
                            any(
                                    VerifyPhoneOtpRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }

        @Test
        void shouldRejectInvalidVerifyPhoneOtpPayload()
                throws Exception {

            final User user =
                    authenticatedUser();

            final VerifyPhoneOtpRequestDto request =
                    VerifyPhoneOtpRequestTestFactory
                            .invalidRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/verify-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isBadRequest()
                    );

            verifyNoInteractions(userService);
        }
    }

    // ============================================================
    // RESEND PHONE OTP
    // ============================================================

    @Nested
    @DisplayName("resendPhoneOtp")
    class ResendPhoneOtpTests {

        @Test
        void shouldResendPhoneOtpForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            final ResendPhoneOtpRequestDto request =
                    ResendPhoneOtpRequestTestFactory
                            .validRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/resend-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .resendPhoneOtp(
                            any(
                                    ResendPhoneOtpRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }

        @Test
        void shouldRejectInvalidResendPhoneOtpRequest()
                throws Exception {

            final User user =
                    authenticatedUser();

            final ResendPhoneOtpRequestDto request =
                    ResendPhoneOtpRequestTestFactory
                            .invalidRequest();

            mockMvc.perform(
                            post(
                                    BASE_URL
                                            + "/phone/resend-otp"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isBadRequest()
                    );

            verifyNoInteractions(userService);
        }
    }

    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    @Nested
    @DisplayName("changePassword")
    class ChangePasswordTests {

        @Test
        void shouldChangePasswordForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            mockMvc.perform(
                            patch(
                                    BASE_URL
                                            + "/password"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            ChangePasswordRequestTestFactory
                                                                    .validRequest()
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .changePassword(
                            any(),
                            eq(USER_EMAIL)
                    );
        }
    }

    // ============================================================
    // SET PASSWORD
    // ============================================================

    @Nested
    @DisplayName("setPassword")
    class SetPasswordTests {

        @Test
        void shouldSetPasswordForAuthenticatedUser()
                throws Exception {

            final User user =
                    authenticatedUser();

            final SetPasswordRequestDto request =
                    SetPasswordRequestTestFactory
                            .validRequest();

            mockMvc.perform(
                            patch(
                                    BASE_URL
                                            + "/set-password"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                                    .contentType(
                                            MediaType.APPLICATION_JSON
                                    )
                                    .content(
                                            objectMapper
                                                    .writeValueAsString(
                                                            request
                                                    )
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .setPassword(
                            any(
                                    SetPasswordRequestDto.class
                            ),
                            eq(USER_EMAIL)
                    );
        }
    }

    @Nested
    @DisplayName("deleteAccount")
    class DeleteAccountTests {

        @Test
        void shouldDeleteAccount()
                throws Exception {

            final User user =
                    authenticatedUser();

            mockMvc.perform(
                            delete(
                                    BASE_URL + "/profile"
                            )
                                    .principal(
                                            authentication(user)
                                    )
                    )
                    .andExpect(
                            status().isNoContent()
                    );

            verify(userService)
                    .deleteAccount(USER_EMAIL);
        }
    }
}