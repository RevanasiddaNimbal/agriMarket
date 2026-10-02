package com.agri.market.address.mapper;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.dto.CreateAddressRequestDto;
import com.agri.market.address.dto.UpdateAddressRequestDto;
import com.agri.market.address.entity.Address;
import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.location.entity.Taluk;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AddressMapperTest {

    private final AddressMapper addressMapper = new AddressMapper();

    @Nested
    class ToEntityTests {

        @Test
        void shouldMapCreateRequestToEntity() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("123 Main Street")
                            .addressLine2("Near Temple")
                            .village("Nimbal")
                            .city("Vijayapura")
                            .district("Vijayapura")
                            .state("Karnataka")
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MANUAL)
                            .addressType(AddressType.HOME)
                            .defaultAddress(true)
                            .build();

            final Address result =
                    addressMapper.toEntity(request);

            assertNotNull(result);

            assertEquals(
                    request.getAddressLine1(),
                    result.getAddressLine1()
            );
            assertEquals(
                    request.getAddressLine2(),
                    result.getAddressLine2()
            );
            assertEquals(
                    request.getVillage(),
                    result.getVillage()
            );
            assertEquals(
                    request.getCity(),
                    result.getCity()
            );
            assertEquals(
                    request.getPincode(),
                    result.getPincode()
            );
            assertEquals(
                    request.getCountry(),
                    result.getCountry()
            );
            assertEquals(
                    request.getLocationType(),
                    result.getLocationType()
            );
            assertEquals(
                    request.getAddressType(),
                    result.getAddressType()
            );
            assertEquals(
                    request.isDefaultAddress(),
                    result.isDefaultAddress()
            );
        }

        @Test
        void shouldMapMapLocationCoordinates() {

            final BigDecimal latitude =
                    new BigDecimal("16.830170");

            final BigDecimal longitude =
                    new BigDecimal("75.710030");

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("Farm Road")
                            .city("Vijayapura")
                            .state("Karnataka")
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MAP)
                            .latitude(latitude)
                            .longitude(longitude)
                            .addressType(AddressType.FARM)
                            .defaultAddress(false)
                            .build();

            final Address result =
                    addressMapper.toEntity(request);

            assertEquals(latitude, result.getLatitude());
            assertEquals(longitude, result.getLongitude());
            assertEquals(LocationType.MAP, result.getLocationType());
        }

        @Test
        void shouldPreserveNullOptionalFields() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("Main Road")
                            .addressLine2(null)
                            .village(null)
                            .city("Vijayapura")
                            .district(null)
                            .state("Karnataka")
                            .pincode("586101")
                            .country(null)
                            .locationType(LocationType.MANUAL)
                            .latitude(null)
                            .longitude(null)
                            .addressType(AddressType.OTHER)
                            .defaultAddress(false)
                            .build();

            final Address result =
                    addressMapper.toEntity(request);

            assertNull(result.getAddressLine2());
            assertNull(result.getVillage());
            assertNull(result.getDistrict());
            assertNull(result.getCountry());
            assertNull(result.getLatitude());
            assertNull(result.getLongitude());
        }

        @Test
        void shouldNotPopulateGeneratedFieldsFromCreateRequest() {

            final CreateAddressRequestDto request =
                    CreateAddressRequestDto.builder()
                            .addressLine1("Main Road")
                            .city("Vijayapura")
                            .state("Karnataka")
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MANUAL)
                            .addressType(AddressType.HOME)
                            .defaultAddress(false)
                            .build();

            final Address result =
                    addressMapper.toEntity(request);

            assertNull(result.getId());
            assertNull(result.getCreatedDate());
            assertNull(result.getLastModifiedDate());
        }
    }

    @Nested
    class UpdateEntityTests {

        @Test
        void shouldUpdateAllNonNullFields() {

            final State state = State.builder().name("Old State").build();
            final District district = District.builder().name("Old District").state(state).build();
            final Taluk taluk = Taluk.builder().name("Old Taluk").district(district).build();

            final Address address =
                    Address.builder()
                            .addressLine1("Old Address")
                            .addressLine2("Old Line 2")
                            .village("Old Village")
                            .city("Old City")
                            .taluk(taluk)
                            .pincode("111111")
                            .country("Old Country")
                            .locationType(LocationType.MANUAL)
                            .addressType(AddressType.HOME)
                            .defaultAddress(false)
                            .build();

            final UpdateAddressRequestDto request =
                    UpdateAddressRequestDto.builder()
                            .addressLine1("New Address")
                            .addressLine2("New Line 2")
                            .village("New Village")
                            .city("New City")
                            .district("New District")
                            .state("New State")
                            .pincode("222222")
                            .country("New Country")
                            .locationType(LocationType.MAP)
                            .latitude(new BigDecimal("16.830170"))
                            .longitude(new BigDecimal("75.710030"))
                            .addressType(AddressType.FARM)
                            .defaultAddress(true)
                            .build();

            addressMapper.updateEntity(address, request);

            assertEquals("New Address", address.getAddressLine1());
            assertEquals("New Line 2", address.getAddressLine2());
            assertEquals("New Village", address.getVillage());
            assertEquals("New City", address.getCity());
            assertEquals("222222", address.getPincode());
            assertEquals("New Country", address.getCountry());
            assertEquals(LocationType.MAP, address.getLocationType());
            assertEquals(
                    new BigDecimal("16.830170"),
                    address.getLatitude()
            );
            assertEquals(
                    new BigDecimal("75.710030"),
                    address.getLongitude()
            );
            assertEquals(AddressType.FARM, address.getAddressType());
            assertTrue(address.isDefaultAddress());
        }

        @Test
        void shouldIgnoreNullUpdateFields() {

            final State state = State.builder().name("Karnataka").build();
            final District district = District.builder().name("Existing District").state(state).build();
            final Taluk taluk = Taluk.builder().name("Existing Taluk").district(district).build();

            final Address address =
                    Address.builder()
                            .addressLine1("Existing Address")
                            .addressLine2("Existing Line 2")
                            .village("Existing Village")
                            .city("Existing City")
                            .taluk(taluk)
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MAP)
                            .latitude(new BigDecimal("16.830170"))
                            .longitude(new BigDecimal("75.710030"))
                            .addressType(AddressType.FARM)
                            .defaultAddress(true)
                            .build();

            final UpdateAddressRequestDto request =
                    UpdateAddressRequestDto.builder()
                            .addressLine1(null)
                            .addressLine2(null)
                            .village(null)
                            .city(null)
                            .district(null)
                            .state(null)
                            .pincode(null)
                            .country(null)
                            .locationType(null)
                            .latitude(null)
                            .longitude(null)
                            .addressType(null)
                            .defaultAddress(null)
                            .build();

            addressMapper.updateEntity(address, request);

            assertEquals(
                    "Existing Address",
                    address.getAddressLine1()
            );
            assertEquals(
                    "Existing Line 2",
                    address.getAddressLine2()
            );
            assertEquals(
                    "Existing Village",
                    address.getVillage()
            );
            assertEquals(
                    "Existing City",
                    address.getCity()
            );
            assertEquals(
                    "Existing District",
                    address.getDistrict()
            );
            assertEquals("Karnataka", address.getState());
            assertEquals("586101", address.getPincode());
            assertEquals("India", address.getCountry());
            assertEquals(LocationType.MAP, address.getLocationType());
            assertEquals(
                    new BigDecimal("16.830170"),
                    address.getLatitude()
            );
            assertEquals(
                    new BigDecimal("75.710030"),
                    address.getLongitude()
            );
            assertEquals(AddressType.FARM, address.getAddressType());
            assertTrue(address.isDefaultAddress());
        }

        @Test
        void shouldNotClearExistingCoordinatesWhenUpdateCoordinatesAreNull() {

            final BigDecimal latitude =
                    new BigDecimal("16.830170");

            final BigDecimal longitude =
                    new BigDecimal("75.710030");

            final Address address =
                    Address.builder()
                            .locationType(LocationType.MAP)
                            .latitude(latitude)
                            .longitude(longitude)
                            .build();

            final UpdateAddressRequestDto request =
                    UpdateAddressRequestDto.builder()
                            .latitude(null)
                            .longitude(null)
                            .build();

            addressMapper.updateEntity(address, request);

            assertEquals(latitude, address.getLatitude());
            assertEquals(longitude, address.getLongitude());
        }
    }

    @Nested
    class ToResponseTests {

        @Test
        void shouldMapEntityToResponse() {

            final BigDecimal latitude =
                    new BigDecimal("16.830170");

            final BigDecimal longitude =
                    new BigDecimal("75.710030");

            final State state = State.builder().name("Karnataka").build();
            final District district = District.builder().name("Vijayapura").state(state).build();
            final Taluk taluk = Taluk.builder().name("Vijayapura").district(district).build();

            final Address address =
                    Address.builder()
                            .addressLine1("Farm Road")
                            .addressLine2("Near Lake")
                            .village("Nimbal")
                            .city("Vijayapura")
                            .taluk(taluk)
                            .pincode("586101")
                            .country("India")
                            .locationType(LocationType.MAP)
                            .latitude(latitude)
                            .longitude(longitude)
                            .addressType(AddressType.FARM)
                            .defaultAddress(true)
                            .build();

            final AddressResponseDto response =
                    addressMapper.toResponse(address);

            assertNotNull(response);

            assertEquals("Farm Road", response.getAddressLine1());
            assertEquals("Near Lake", response.getAddressLine2());
            assertEquals("Nimbal", response.getVillage());
            assertEquals("Vijayapura", response.getCity());
            assertEquals("Vijayapura", response.getDistrict());
            assertEquals("Karnataka", response.getState());
            assertEquals("586101", response.getPincode());
            assertEquals("India", response.getCountry());
            assertEquals(LocationType.MAP, response.getLocationType());
            assertEquals(latitude, response.getLatitude());
            assertEquals(longitude, response.getLongitude());
            assertEquals(AddressType.FARM, response.getAddressType());
            assertTrue(response.isDefaultAddress());
        }

        @Test
        void shouldPreserveNullValuesInResponse() {

            final Address address =
                    Address.builder()
                            .addressLine1("Main Road")
                            .locationType(LocationType.MANUAL)
                            .latitude(null)
                            .longitude(null)
                            .build();

            final AddressResponseDto response =
                    addressMapper.toResponse(address);

            assertNotNull(response);

            assertEquals("Main Road", response.getAddressLine1());
            assertEquals(LocationType.MANUAL, response.getLocationType());
            assertNull(response.getLatitude());
            assertNull(response.getLongitude());
            assertNull(response.getCreatedDate());
            assertNull(response.getLastModifiedDate());
        }
    }
}