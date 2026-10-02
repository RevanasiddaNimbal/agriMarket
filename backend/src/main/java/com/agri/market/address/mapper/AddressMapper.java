package com.agri.market.address.mapper;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.dto.CreateAddressRequestDto;
import com.agri.market.address.dto.UpdateAddressRequestDto;
import com.agri.market.address.entity.Address;
import com.agri.market.location.entity.Taluk;
import com.agri.market.order.entity.OrderAddressSnapshot;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public Address toEntity(
            final CreateAddressRequestDto request
    ) {
        return Address.builder()
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .village(request.getVillage())
                .city(request.getCity())
                .pincode(request.getPincode())
                .country(request.getCountry())
                .locationType(request.getLocationType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .addressType(request.getAddressType())
                .defaultAddress(request.isDefaultAddress())
                .build();
    }

    public Address toEntity(
            final CreateAddressRequestDto request,
            final Taluk taluk
    ) {
        final Address address = toEntity(request);
        address.setTaluk(taluk);
        return address;
    }

    public void updateEntity(
            final Address address,
            final UpdateAddressRequestDto request
    ) {
        if (request.getAddressLine1() != null) {
            address.setAddressLine1(request.getAddressLine1());
        }

        if (request.getAddressLine2() != null) {
            address.setAddressLine2(request.getAddressLine2());
        }

        if (request.getVillage() != null) {
            address.setVillage(request.getVillage());
        }

        if (request.getCity() != null) {
            address.setCity(request.getCity());
        }

        if (request.getPincode() != null) {
            address.setPincode(request.getPincode());
        }

        if (request.getCountry() != null) {
            address.setCountry(request.getCountry());
        }

        if (request.getLocationType() != null) {
            address.setLocationType(request.getLocationType());
        }

        if (request.getLatitude() != null) {
            address.setLatitude(request.getLatitude());
        }

        if (request.getLongitude() != null) {
            address.setLongitude(request.getLongitude());
        }

        if (request.getAddressType() != null) {
            address.setAddressType(request.getAddressType());
        }

        if (request.getDefaultAddress() != null) {
            address.setDefaultAddress(request.getDefaultAddress());
        }
    }

    public AddressResponseDto toResponse(
            final Address address
    ) {
        if (address == null) {
            return null;
        }

        return AddressResponseDto.builder()
                .id(address.getId())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .village(address.getVillage())
                .city(address.getCity())
                .district(address.getDistrict())
                .state(address.getState())
                .pincode(address.getPincode())
                .country(address.getCountry())
                .locationType(address.getLocationType())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .addressType(address.getAddressType())
                .defaultAddress(address.isDefaultAddress())
                .createdDate(address.getCreatedDate())
                .lastModifiedDate(address.getLastModifiedDate())
                .build();
    }

    public AddressResponseDto toSnapshotResponse(
            final OrderAddressSnapshot orderAddressSnapshot
    ) {
        if (orderAddressSnapshot == null) {
            return null;
        }

        return AddressResponseDto.builder()
                .id(orderAddressSnapshot.getId())
                .addressLine1(orderAddressSnapshot.getAddressLine1())
                .addressLine2(orderAddressSnapshot.getAddressLine2())
                .village(orderAddressSnapshot.getVillage())
                .city(orderAddressSnapshot.getCity())
                .district(orderAddressSnapshot.getDistrict())
                .state(orderAddressSnapshot.getState())
                .pincode(orderAddressSnapshot.getPincode())
                .country(orderAddressSnapshot.getCountry())
                .locationType(orderAddressSnapshot.getLocationType())
                .latitude(orderAddressSnapshot.getLatitude())
                .longitude(orderAddressSnapshot.getLongitude())
                .addressType(orderAddressSnapshot.getAddressType())
                .defaultAddress(false)
                .createdDate(orderAddressSnapshot.getCreatedDate())
                .lastModifiedDate(orderAddressSnapshot.getLastModifiedDate())
                .build();
    }

    public AddressResponseDto toSnapshotResponse(
            final com.agri.market.product.entity.ProductLocationSnapshot productLocationSnapshot
    ) {
        if (productLocationSnapshot == null) {
            return null;
        }

        return AddressResponseDto.builder()
                .id(productLocationSnapshot.getId())
                .addressLine1(productLocationSnapshot.getAddressLine1())
                .addressLine2(productLocationSnapshot.getAddressLine2())
                .village(productLocationSnapshot.getVillage())
                .city(productLocationSnapshot.getCity())
                .district(productLocationSnapshot.getDistrict())
                .state(productLocationSnapshot.getState())
                .pincode(productLocationSnapshot.getPincode())
                .country(productLocationSnapshot.getCountry())
                .locationType(productLocationSnapshot.getLocationType())
                .latitude(productLocationSnapshot.getLatitude())
                .longitude(productLocationSnapshot.getLongitude())
                .addressType(productLocationSnapshot.getAddressType())
                .defaultAddress(false)
                .createdDate(productLocationSnapshot.getCreatedDate())
                .lastModifiedDate(productLocationSnapshot.getLastModifiedDate())
                .build();
    }
}