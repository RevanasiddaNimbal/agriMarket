package com.agri.market.address.service;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.dto.CreateAddressRequestDto;
import com.agri.market.address.dto.UpdateAddressRequestDto;
import com.agri.market.address.entity.Address;
import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.agri.market.address.mapper.AddressMapper;
import com.agri.market.address.repository.AddressRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.location.entity.Taluk;
import com.agri.market.location.repository.DistrictRepository;
import com.agri.market.location.repository.StateRepository;
import com.agri.market.location.repository.TalukRepository;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static com.agri.market.common.exception.ErrorCode.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    private final String userEmail = "user@example.com";
    private final String userId = "user-123";
    private final String addressId = "address-123";

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private TalukRepository talukRepository;

    @Mock
    private DistrictRepository districtRepository;

    @Mock
    private StateRepository stateRepository;

    @InjectMocks
    private AddressServiceImpl addressService;

    private User user;
    private Address address;
    private AddressResponseDto response;
    private State state;
    private District district;
    private Taluk taluk;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id(userId)
                .email(userEmail)
                .build();

        state = State.builder().id("s-1").name("Karnataka").build();
        district = District.builder().id("d-1").name("Vijayapura").state(state).build();
        taluk = Taluk.builder().id("t-1").name("Vijayapura").district(district).build();

        address = Address.builder()
                .addressLine1("Main Road")
                .city("Vijayapura")
                .taluk(taluk)
                .pincode("586101")
                .country("India")
                .locationType(LocationType.MANUAL)
                .addressType(AddressType.HOME)
                .defaultAddress(false)
                .build();

        response = AddressResponseDto.builder()
                .addressLine1("Main Road")
                .city("Vijayapura")
                .district("Vijayapura")
                .state("Karnataka")
                .pincode("586101")
                .country("India")
                .locationType(LocationType.MANUAL)
                .addressType(AddressType.HOME)
                .defaultAddress(false)
                .build();
    }

    @Nested
    class CreateAddressTests {

        @Test
        void shouldCreateManualAddress() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("Main Road")
                            .city("Vijayapura")
                            .district("Vijayapura")
                            .state("Karnataka")
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MANUAL)
                            .addressType(AddressType.HOME)
                            .defaultAddress(false)
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(districtRepository.findByStateNameAndDistrictName("Karnataka", "Vijayapura"))
                    .willReturn(Optional.of(district));

            given(talukRepository.findByDistrictIdAndNormalizedName("d-1", "vijayapura"))
                    .willReturn(Optional.of(taluk));

            given(addressMapper.toEntity(request, taluk))
                    .willReturn(address);

            given(addressRepository.save(address))
                    .willReturn(address);

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            final AddressResponseDto result =
                    addressService.createAddress(
                            request,
                            userEmail
                    );

            assertNotNull(result);

            verify(addressRepository, never())
                    .clearDefaultAddressByUserId(anyString());

            verify(addressRepository).save(address);
        }

        @Test
        void shouldClearDefaultAddressWhenNewAddressIsDefault() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("Main Road")
                            .city("Vijayapura")
                            .district("Vijayapura")
                            .state("Karnataka")
                            .pincode("586101")
                            .locationType(LocationType.MANUAL)
                            .addressType(AddressType.HOME)
                            .defaultAddress(true)
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(districtRepository.findByStateNameAndDistrictName("Karnataka", "Vijayapura"))
                    .willReturn(Optional.of(district));

            given(talukRepository.findByDistrictIdAndNormalizedName("d-1", "vijayapura"))
                    .willReturn(Optional.of(taluk));

            given(addressMapper.toEntity(request, taluk))
                    .willReturn(address);

            given(addressRepository.save(address))
                    .willReturn(address);

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            addressService.createAddress(
                    request,
                    userEmail
            );

            verify(addressRepository)
                    .clearDefaultAddressByUserId(userId);

            verify(addressRepository).save(address);
        }

        @Test
        void shouldThrowExceptionWhenUserNotFound() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder().build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.empty());

            final BusinessException exception =
                    assertThrows(
                            BusinessException.class,
                            () -> addressService.createAddress(
                                    request,
                                    userEmail
                            )
                    );

            assertEquals(USER_NOT_FOUND, exception.getErrorCode());
        }

        @Test
        void shouldThrowExceptionWhenMapAddressWithoutCoordinates() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .locationType(LocationType.MAP)
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            final BusinessException exception =
                    assertThrows(
                            BusinessException.class,
                            () -> addressService.createAddress(
                                    request,
                                    userEmail
                            )
                    );

            assertEquals(
                    ADDRESS_COORDINATES_REQUIRED,
                    exception.getErrorCode()
            );
        }

        @Test
        void shouldThrowExceptionWhenManualAddressWithCoordinates() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .locationType(LocationType.MANUAL)
                            .latitude(BigDecimal.valueOf(16.8302))
                            .longitude(BigDecimal.valueOf(75.7100))
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            final BusinessException exception =
                    assertThrows(
                            BusinessException.class,
                            () -> addressService.createAddress(
                                    request,
                                    userEmail
                            )
                    );

            assertEquals(
                    ADDRESS_COORDINATES_NOT_ALLOWED,
                    exception.getErrorCode()
            );
        }
    }

    @Nested
    class GetUserAddressesTests {

        @Test
        void shouldReturnAllUserAddresses() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findAllByUserId(userId))
                    .willReturn(List.of(address));

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            final List<AddressResponseDto> result =
                    addressService.getUserAddresses(userEmail);

            assertEquals(1, result.size());
        }

        @Test
        void shouldThrowExceptionWhenUserNotFound() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.empty());

            final BusinessException exception =
                    assertThrows(
                            BusinessException.class,
                            () -> addressService.getUserAddresses(
                                    userEmail
                            )
                    );

            assertEquals(USER_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    class GetAddressTests {

        @Test
        void shouldReturnSpecificAddress() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            final AddressResponseDto result =
                    addressService.getAddress(addressId, userEmail);

            assertNotNull(result);
        }

        @Test
        void shouldThrowExceptionWhenAddressNotFound() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.empty());

            final BusinessException exception =
                    assertThrows(
                            BusinessException.class,
                            () -> addressService.getAddress(
                                    addressId,
                                    userEmail
                            )
                    );

            assertEquals(ADDRESS_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    class UpdateAddressTests {

        @Test
        void shouldUpdateAddressSuccessfully() {

            final UpdateAddressRequestDto request =
                    UpdateAddressRequestDto.builder()
                            .addressLine1("Updated Line")
                            .city("Vijayapura")
                            .district("Vijayapura")
                            .state("Karnataka")
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            given(districtRepository.findByStateNameAndDistrictName("Karnataka", "Vijayapura"))
                    .willReturn(Optional.of(district));

            given(talukRepository.findByDistrictIdAndNormalizedName("d-1", "vijayapura"))
                    .willReturn(Optional.of(taluk));

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            final AddressResponseDto result =
                    addressService.updateAddress(
                            addressId,
                            request,
                            userEmail
                    );

            assertNotNull(result);

            verify(addressMapper)
                    .updateEntity(address, request);
        }

        @Test
        void shouldClearDefaultsWhenUpdatingToDefault() {

            final UpdateAddressRequestDto request =
                    UpdateAddressRequestDto.builder()
                            .defaultAddress(true)
                            .build();

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            given(districtRepository.findByStateNameAndDistrictName("Karnataka", "Vijayapura"))
                    .willReturn(Optional.of(district));

            given(talukRepository.findByDistrictIdAndNormalizedName("d-1", "vijayapura"))
                    .willReturn(Optional.of(taluk));

            given(addressMapper.toResponse(address))
                    .willReturn(response);

            addressService.updateAddress(
                    addressId,
                    request,
                    userEmail
            );

            verify(addressRepository)
                    .clearDefaultAddressByUserId(userId);

            assertTrue(address.isDefaultAddress());
        }
    }

    @Nested
    class SetDefaultAddressTests {

        @Test
        void shouldSetAddressAsDefault() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            addressService.setDefaultAddress(addressId, userEmail);

            verify(addressRepository)
                    .clearDefaultAddressByUserId(userId);

            assertTrue(address.isDefaultAddress());
        }

        @Test
        void shouldDoNothingIfAlreadyDefault() {

            address.setDefaultAddress(true);

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            addressService.setDefaultAddress(addressId, userEmail);

            verify(addressRepository, never())
                    .clearDefaultAddressByUserId(anyString());
        }
    }

    @Nested
    class DeleteAddressTests {

        @Test
        void shouldDeleteAddressSuccessfully() {

            given(userRepository.findByEmailIgnoreCase(userEmail))
                    .willReturn(Optional.of(user));

            given(addressRepository.findByIdAndUserId(addressId, userId))
                    .willReturn(Optional.of(address));

            addressService.deleteAddress(addressId, userEmail);

            verify(addressRepository).delete(address);
        }
    }
}