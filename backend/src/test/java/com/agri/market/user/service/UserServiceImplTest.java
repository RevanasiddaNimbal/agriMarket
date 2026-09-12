package com.agri.market.user.service;

import com.agri.market.cloudinary.service.CloudinaryService;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.sms.service.SmsService;
import com.agri.market.support.ChangePasswordRequestTestFactory;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.dto.*;
import com.agri.market.user.entity.User;
import com.agri.market.user.mapper.UserMapper;
import com.agri.market.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static com.agri.market.common.exception.ErrorCode.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl")
class UserServiceImplTest {

    private static final String USER_EMAIL = "revanasidda@mail.com";
    private static final String CURRENT_PASSWORD = "Old@Password123";
    private static final String NEW_PASSWORD = "New@Password123";
    private static final String ENCODED_PASSWORD = "encoded-password";
    private static final String ENCODED_NEW_PASSWORD = "encoded-new-password";
    private static final String PHONE_NUMBER = "9876543210";
    private static final String NEW_PHONE_NUMBER = "8765432109";
    private static final String OTP = "123456";

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SmsService smsService;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private UserServiceImpl userService;

    private SetPasswordRequestDto validSetPasswordRequest() {

        SetPasswordRequestDto request =
                new SetPasswordRequestDto();

        request.setNewPassword(NEW_PASSWORD);
        request.setConfirmNewPassword(NEW_PASSWORD);

        return request;
    }

    @Nested
    @DisplayName("loadUserByUsername")
    class LoadUserByUsernameTests {

        @Test
        void shouldReturnUserWhenUserExists() {

            User user = UserTestFactory.activeUser();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            UserDetails result =
                    userService.loadUserByUsername(USER_EMAIL);

            assertThat(result)
                    .isSameAs(user);

            verify(userRepository)
                    .findByEmailIgnoreCase(USER_EMAIL);
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.loadUserByUsername(USER_EMAIL)
            )
                    .isInstanceOf(UsernameNotFoundException.class)
                    .hasMessageContaining(USER_EMAIL);

            verify(userRepository)
                    .findByEmailIgnoreCase(USER_EMAIL);
        }
    }

    @Nested
    @DisplayName("getCurrentUserProfile")
    class GetCurrentUserProfileTests {

        @Test
        void shouldReturnCurrentUserProfile() {

            User user = UserTestFactory.activeUser();

            UserProfileResponseDto response =
                    UserProfileResponseDto.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .emailVerified(user.isEmailVerified())
                            .phoneVerified(user.isPhoneVerified())
                            .profilePictureUrl(user.getProfilePictureUrl())
                            .build();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userMapper.toUserProfileResponseDto(user))
                    .thenReturn(response);

            UserProfileResponseDto result =
                    userService.getCurrentUserProfile(USER_EMAIL);

            assertThat(result)
                    .isSameAs(response);

            verify(userRepository)
                    .findByEmailIgnoreCase(USER_EMAIL);

            verify(userMapper)
                    .toUserProfileResponseDto(user);

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.getCurrentUserProfile(USER_EMAIL)
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(userMapper);
        }
    }

    @Nested
    @DisplayName("updateFullName")
    class UpdateFullNameTests {

        @Test
        void shouldUpdateFullNameSuccessfully() {

            User user = UserTestFactory.activeUser();

            UpdateFullNameRequestDto request =
                    new UpdateFullNameRequestDto();

            request.setFullName("  Updated Name  ");

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            userService.updateFullName(
                    request,
                    USER_EMAIL
            );

            assertThat(user.getFullName())
                    .isEqualTo("Updated Name");

            verify(userRepository)
                    .save(user);
        }

        @Test
        void shouldNotSaveWhenFullNameIsUnchanged() {

            User user = UserTestFactory.activeUser();

            UpdateFullNameRequestDto request =
                    new UpdateFullNameRequestDto();

            request.setFullName(
                    "  " + user.getFullName() + "  "
            );

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            userService.updateFullName(
                    request,
                    USER_EMAIL
            );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            UpdateFullNameRequestDto request =
                    new UpdateFullNameRequestDto();

            request.setFullName("Updated Name");

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.updateFullName(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateRepositoryFailure() {

            User user = UserTestFactory.activeUser();

            UpdateFullNameRequestDto request =
                    new UpdateFullNameRequestDto();

            request.setFullName("Updated Name");

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            doThrow(new RuntimeException("db down"))
                    .when(userRepository)
                    .save(user);

            assertThatThrownBy(
                    () -> userService.updateFullName(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("db down");
        }
    }

    @Nested
    @DisplayName("updateProfilePicture")
    class UpdateProfilePictureTests {

        @Test
        void shouldUpdateProfilePictureSuccessfully() {

            final User user =
                    UserTestFactory.activeUser();

            final MockMultipartFile profilePicture =
                    new MockMultipartFile(
                            "profilePicture",
                            "profile.jpg",
                            "image/jpeg",
                            "test-image-content".getBytes()
                    );

            final UpdateProfilePictureRequestDto request =
                    new UpdateProfilePictureRequestDto();

            request.setProfilePicture(profilePicture);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            userService.updateProfilePicture(
                    request,
                    USER_EMAIL
            );

            verify(userRepository)
                    .findByEmailIgnoreCase(USER_EMAIL);
        }
        
        @Test
        void shouldThrowWhenUserDoesNotExist() {

            MockMultipartFile profilePicture =
                    new MockMultipartFile(
                            "profilePicture",
                            "profile.jpg",
                            "image/jpeg",
                            "test-image-content".getBytes()
                    );

            UpdateProfilePictureRequestDto request =
                    new UpdateProfilePictureRequestDto();

            request.setProfilePicture(profilePicture);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.updateProfilePicture(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }
    }

    @Nested
    @DisplayName("sendPhoneOtp")
    class SendPhoneOtpTests {

        @Test
        void shouldSendOtpWhenAddingFirstPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(null);
            user.setPhoneVerified(false);

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(
                    "  " + PHONE_NUMBER + "  "
            );

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            userService.sendPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .sendOtp(PHONE_NUMBER);

            verify(userRepository, never())
                    .save(any(User.class));

            assertThat(user.getPhoneNumber())
                    .isNull();

            assertThat(user.isPhoneVerified())
                    .isFalse();
        }

        @Test
        void shouldSendOtpWhenChangingExistingPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(true);

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(NEW_PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(NEW_PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            userService.sendPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .sendOtp(NEW_PHONE_NUMBER);

            verify(userRepository, never())
                    .save(any(User.class));

            assertThat(user.getPhoneNumber())
                    .isEqualTo(PHONE_NUMBER);

            assertThat(user.isPhoneVerified())
                    .isTrue();
        }

        @Test
        void shouldRejectSameVerifiedPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(true);

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            assertThatThrownBy(
                    () -> userService.sendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_OTP_ALREADY_VERIFIED)
                    );

            verifyNoInteractions(smsService);

            verify(userRepository, never())
                    .findByPhoneNumber(anyString());
        }

        @Test
        void shouldRejectPhoneNumberBelongingToAnotherUser() {

            User user = UserTestFactory.activeUser();
            User anotherUser = UserTestFactory.activeUser();

            anotherUser.setId("another-user-id");

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.of(anotherUser));

            assertThatThrownBy(
                    () -> userService.sendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_ALREADY_EXISTS)
                    );

            verifyNoInteractions(smsService);
        }

        @Test
        void shouldAllowPhoneNumberBelongingToSameUser() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(false);

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.of(user));

            userService.sendPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .sendOtp(PHONE_NUMBER);

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateSmsProviderFailure() {

            User user = UserTestFactory.activeUser();

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(SMS_PROVIDER_ERROR))
                    .when(smsService)
                    .sendOtp(PHONE_NUMBER);

            assertThatThrownBy(
                    () -> userService.sendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(SMS_PROVIDER_ERROR)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            SendPhoneOtpRequestDto request =
                    new SendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.sendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(smsService);

            verify(userRepository, never())
                    .findByPhoneNumber(anyString());
        }
    }

    @Nested
    @DisplayName("verifyPhoneOtp")
    class VerifyPhoneOtpTests {

        @Test
        void shouldVerifyAndSaveFirstPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(null);
            user.setPhoneVerified(false);

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(
                    "  " + PHONE_NUMBER + "  "
            );
            request.setOtp(
                    "  " + OTP + "  "
            );

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            userService.verifyPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .verifyOtp(PHONE_NUMBER, OTP);

            verify(userRepository)
                    .save(user);

            assertThat(user.getPhoneNumber())
                    .isEqualTo(PHONE_NUMBER);

            assertThat(user.isPhoneVerified())
                    .isTrue();
        }

        @Test
        void shouldReplaceExistingPhoneAfterSuccessfulVerification() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(true);

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(NEW_PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(NEW_PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            userService.verifyPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .verifyOtp(
                            NEW_PHONE_NUMBER,
                            OTP
                    );

            verify(userRepository)
                    .save(user);

            assertThat(user.getPhoneNumber())
                    .isEqualTo(NEW_PHONE_NUMBER);

            assertThat(user.isPhoneVerified())
                    .isTrue();
        }

        @Test
        void shouldRejectSameVerifiedPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(true);

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_OTP_ALREADY_VERIFIED)
                    );

            verifyNoInteractions(smsService);

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldRejectPhoneNumberBelongingToAnotherUser() {

            User user = UserTestFactory.activeUser();
            User anotherUser = UserTestFactory.activeUser();

            anotherUser.setId("another-user-id");

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.of(anotherUser));

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_ALREADY_EXISTS)
                    );

            verifyNoInteractions(smsService);

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateInvalidOtp() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(null);
            user.setPhoneVerified(false);

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(INVALID_PHONE_OTP))
                    .when(smsService)
                    .verifyOtp(
                            PHONE_NUMBER,
                            OTP
                    );

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(INVALID_PHONE_OTP)
                    );

            assertThat(user.getPhoneNumber())
                    .isNull();

            assertThat(user.isPhoneVerified())
                    .isFalse();

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateExpiredOtp() {

            User user = UserTestFactory.activeUser();

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(PHONE_OTP_EXPIRED))
                    .when(smsService)
                    .verifyOtp(
                            PHONE_NUMBER,
                            OTP
                    );

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_OTP_EXPIRED)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateOtpNotRequested() {

            User user = UserTestFactory.activeUser();

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(PHONE_OTP_NOT_REQUESTED))
                    .when(smsService)
                    .verifyOtp(
                            PHONE_NUMBER,
                            OTP
                    );

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_OTP_NOT_REQUESTED)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateSmsProviderFailure() {

            User user = UserTestFactory.activeUser();

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(SMS_PROVIDER_ERROR))
                    .when(smsService)
                    .verifyOtp(
                            PHONE_NUMBER,
                            OTP
                    );

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(SMS_PROVIDER_ERROR)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            VerifyPhoneOtpRequestDto request =
                    new VerifyPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);
            request.setOtp(OTP);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.verifyPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(smsService);

            verify(userRepository, never())
                    .findByPhoneNumber(anyString());
        }
    }

    @Nested
    @DisplayName("resendPhoneOtp")
    class ResendPhoneOtpTests {

        @Test
        void shouldResendOtpSuccessfully() {

            User user = UserTestFactory.activeUser();

            ResendPhoneOtpRequestDto request =
                    new ResendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            userService.resendPhoneOtp(
                    request,
                    USER_EMAIL
            );

            verify(smsService)
                    .resendOtp(PHONE_NUMBER);

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateResendBlockedException() {

            User user = UserTestFactory.activeUser();

            ResendPhoneOtpRequestDto request =
                    new ResendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(
                    PHONE_OTP_RESEND_NOT_ALLOWED
            ))
                    .when(smsService)
                    .resendOtp(PHONE_NUMBER);

            assertThatThrownBy(
                    () -> userService.resendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(
                                    PHONE_OTP_RESEND_NOT_ALLOWED
                            )
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldPropagateSmsProviderFailure() {

            User user = UserTestFactory.activeUser();

            ResendPhoneOtpRequestDto request =
                    new ResendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(userRepository.findByPhoneNumber(PHONE_NUMBER))
                    .thenReturn(Optional.empty());

            doThrow(new BusinessException(SMS_PROVIDER_ERROR))
                    .when(smsService)
                    .resendOtp(PHONE_NUMBER);

            assertThatThrownBy(
                    () -> userService.resendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(SMS_PROVIDER_ERROR)
                    );

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldRejectSameVerifiedPhoneNumber() {

            User user = UserTestFactory.activeUser();

            user.setPhoneNumber(PHONE_NUMBER);
            user.setPhoneVerified(true);

            ResendPhoneOtpRequestDto request =
                    new ResendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            assertThatThrownBy(
                    () -> userService.resendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PHONE_OTP_ALREADY_VERIFIED)
                    );

            verifyNoInteractions(smsService);
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            ResendPhoneOtpRequestDto request =
                    new ResendPhoneOtpRequestDto();

            request.setPhoneNumber(PHONE_NUMBER);

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.resendPhoneOtp(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(smsService);
        }
    }

    @Nested
    @DisplayName("setPassword")
    class SetPasswordTests {

        @Test
        void shouldSetPasswordSuccessfully() {

            User user = UserTestFactory.activeUser();

            user.setPassword(null);
            user.setFailedLoginAttempts(4);
            user.setTemporaryLockedUntil(
                    LocalDateTime.now().plusMinutes(10)
            );
            user.setCredentialsExpired(true);

            SetPasswordRequestDto request =
                    validSetPasswordRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(passwordEncoder.encode(NEW_PASSWORD))
                    .thenReturn(ENCODED_NEW_PASSWORD);

            userService.setPassword(
                    request,
                    USER_EMAIL
            );

            assertThat(user.getPassword())
                    .isEqualTo(ENCODED_NEW_PASSWORD);

            assertThat(user.getPasswordChangedAt())
                    .isNotNull();

            assertThat(user.isCredentialsExpired())
                    .isFalse();

            assertThat(user.getFailedLoginAttempts())
                    .isZero();

            assertThat(user.getTemporaryLockedUntil())
                    .isNull();

            verify(passwordEncoder)
                    .encode(NEW_PASSWORD);

            verify(userRepository)
                    .save(user);
        }

        @Test
        void shouldAllowBlankExistingPassword() {

            User user = UserTestFactory.activeUser();

            user.setPassword("   ");

            SetPasswordRequestDto request =
                    validSetPasswordRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(passwordEncoder.encode(NEW_PASSWORD))
                    .thenReturn(ENCODED_NEW_PASSWORD);

            userService.setPassword(
                    request,
                    USER_EMAIL
            );

            assertThat(user.getPassword())
                    .isEqualTo(ENCODED_NEW_PASSWORD);

            verify(passwordEncoder)
                    .encode(NEW_PASSWORD);

            verify(userRepository)
                    .save(user);
        }

        @Test
        void shouldRejectWhenPasswordsDoNotMatch() {

            SetPasswordRequestDto request =
                    validSetPasswordRequest();

            request.setConfirmNewPassword(
                    "Different@Password123"
            );

            assertThatThrownBy(
                    () -> userService.setPassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PASSWORD_MISMATCH)
                    );

            verifyNoInteractions(
                    userRepository,
                    passwordEncoder
            );
        }

        @Test
        void shouldRejectWhenPasswordAlreadyExists() {

            User user = UserTestFactory.activeUser();

            user.setPassword(ENCODED_PASSWORD);

            SetPasswordRequestDto request =
                    validSetPasswordRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            assertThatThrownBy(
                    () -> userService.setPassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PASSWORD_ALREADY_SET)
                    );

            verify(passwordEncoder, never())
                    .encode(anyString());

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            SetPasswordRequestDto request =
                    validSetPasswordRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.setPassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(passwordEncoder);

            verify(userRepository, never())
                    .save(any(User.class));
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePasswordTests {

        @Test
        void shouldRejectWhenNewPasswordMatchesCurrentPassword() {

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            request.setNewPassword(CURRENT_PASSWORD);
            request.setConfirmNewPassword(CURRENT_PASSWORD);

            assertThatThrownBy(
                    () -> userService.changePassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PASSWORD_MISMATCH)
                    );

            verifyNoInteractions(
                    userRepository,
                    passwordEncoder
            );
        }

        @Test
        void shouldRejectWhenPasswordsDoNotMatch() {

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            request.setConfirmNewPassword(
                    "Different@Password123"
            );

            assertThatThrownBy(
                    () -> userService.changePassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(PASSWORD_MISMATCH)
                    );

            verifyNoInteractions(
                    userRepository,
                    passwordEncoder
            );
        }

        @Test
        void shouldRejectWhenUserDoesNotExist() {

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.changePassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verifyNoInteractions(passwordEncoder);
        }

        @Test
        void shouldRejectWhenPasswordIsNotConfigured() {

            User user = UserTestFactory.activeUser();

            user.setPassword(null);

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            assertThatThrownBy(
                    () -> userService.changePassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(
                                    PASSWORD_LOGIN_NOT_AVAILABLE
                            )
                    );

            verify(passwordEncoder, never())
                    .matches(anyString(), anyString());

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldRejectWhenCurrentPasswordIsInvalid() {

            User user = UserTestFactory.activeUser();

            user.setPassword(ENCODED_PASSWORD);

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(passwordEncoder.matches(
                    CURRENT_PASSWORD,
                    ENCODED_PASSWORD
            )).thenReturn(false);

            assertThatThrownBy(
                    () -> userService.changePassword(
                            request,
                            USER_EMAIL
                    )
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(INVALID_CURRENT_PASSWORD)
                    );

            verify(passwordEncoder)
                    .matches(
                            CURRENT_PASSWORD,
                            ENCODED_PASSWORD
                    );

            verify(passwordEncoder, never())
                    .encode(anyString());

            verify(userRepository, never())
                    .save(any(User.class));
        }

        @Test
        void shouldChangePasswordSuccessfully() {

            User user = UserTestFactory.activeUser();

            user.setPassword(ENCODED_PASSWORD);
            user.setFailedLoginAttempts(3);
            user.setTemporaryLockedUntil(
                    LocalDateTime.now().plusMinutes(10)
            );
            user.setCredentialsExpired(true);

            ChangePasswordRequestDto request =
                    ChangePasswordRequestTestFactory.validRequest();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            when(passwordEncoder.matches(
                    CURRENT_PASSWORD,
                    ENCODED_PASSWORD
            )).thenReturn(true);

            when(passwordEncoder.encode(NEW_PASSWORD))
                    .thenReturn(ENCODED_NEW_PASSWORD);

            userService.changePassword(
                    request,
                    USER_EMAIL
            );

            assertThat(user.getPassword())
                    .isEqualTo(ENCODED_NEW_PASSWORD);

            assertThat(user.getPasswordChangedAt())
                    .isNotNull();

            assertThat(user.isCredentialsExpired())
                    .isFalse();

            assertThat(user.getFailedLoginAttempts())
                    .isZero();

            assertThat(user.getTemporaryLockedUntil())
                    .isNull();

            verify(passwordEncoder)
                    .matches(
                            CURRENT_PASSWORD,
                            ENCODED_PASSWORD
                    );

            verify(passwordEncoder)
                    .encode(NEW_PASSWORD);

            verify(userRepository)
                    .save(user);
        }
    }

    @Nested
    @DisplayName("deleteAccount")
    class DeleteAccountTests {

        @Test
        void shouldDeleteExistingUser() {

            User user = UserTestFactory.activeUser();

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.of(user));

            userService.deleteAccount(USER_EMAIL);

            verify(userRepository)
                    .delete(user);
        }

        @Test
        void shouldThrowWhenUserDoesNotExist() {

            when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> userService.deleteAccount(USER_EMAIL)
            )
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex ->
                            assertThat(
                                    ((BusinessException) ex).getErrorCode()
                            ).isEqualTo(USER_NOT_FOUND)
                    );

            verify(userRepository, never())
                    .delete(any(User.class));
        }
    }
}
