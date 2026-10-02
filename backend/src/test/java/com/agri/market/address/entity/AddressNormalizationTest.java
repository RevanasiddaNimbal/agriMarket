package com.agri.market.address.entity;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.mapper.AddressMapper;
import com.agri.market.location.entity.District;
import com.agri.market.location.entity.State;
import com.agri.market.location.entity.Taluk;
import com.agri.market.order.entity.OrderAddressSnapshot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AddressNormalizationTest")
class AddressNormalizationTest {

    private final AddressMapper mapper = new AddressMapper();

    @Test
    void shouldStoreTalukRelationshipAndDeriveStateAndDistrict() {
        final State state = State.builder().id("s-700").name("Karnataka").code("KA").build();
        final District district = District.builder().id("d-700").name("Vijayapura").code("KA-VJP").state(state).build();
        final Taluk taluk = Taluk.builder().id("t-700").name("Vijayapura").code("KA-VJP-01").district(district).build();

        final Address address = Address.builder()
                .addressLine1("12 Main Road")
                .city("Vijayapura")
                .taluk(taluk)
                .pincode("586101")
                .country("India")
                .locationType(LocationType.MANUAL)
                .addressType(AddressType.HOME)
                .build();

        assertThat(address.getTaluk()).isEqualTo(taluk);
        assertThat(address.getDistrict()).isEqualTo("Vijayapura");
        assertThat(address.getState()).isEqualTo("Karnataka");

        final AddressResponseDto response = mapper.toResponse(address);
        assertThat(response.getDistrict()).isEqualTo("Vijayapura");
        assertThat(response.getState()).isEqualTo("Karnataka");
        assertThat(response.getCity()).isEqualTo("Vijayapura");
    }

    @Test
    void shouldPreserveImmutableOrderAddressSnapshotBehavior() {
        final OrderAddressSnapshot snapshot = OrderAddressSnapshot.builder()
                .addressLine1("Historical Line 1")
                .city("Historical City")
                .district("Historical District")
                .state("Historical State")
                .pincode("586101")
                .country("India")
                .locationType(LocationType.MANUAL)
                .addressType(AddressType.HOME)
                .build();

        final AddressResponseDto response = mapper.toSnapshotResponse(snapshot);
        assertThat(response.getAddressLine1()).isEqualTo("Historical Line 1");
        assertThat(response.getDistrict()).isEqualTo("Historical District");
        assertThat(response.getState()).isEqualTo("Historical State");
    }
}
