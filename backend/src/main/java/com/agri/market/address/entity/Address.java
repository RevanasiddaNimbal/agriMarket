package com.agri.market.address.entity;

import com.agri.market.common.entity.BaseEntity;
import com.agri.market.location.entity.Taluk;
import com.agri.market.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "addresses")
public class Address extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_address_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "taluk_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_addresses_taluk")
    )
    private Taluk taluk;

    @Column(
            name = "address_line1",
            nullable = false,
            length = 200
    )
    private String addressLine1;

    @Column(
            name = "address_line2",
            length = 200
    )
    private String addressLine2;

    @Column(
            name = "village",
            length = 100
    )
    private String village;

    @Column(
            name = "city",
            nullable = false,
            length = 100
    )
    private String city;

    @Column(
            name = "pincode",
            nullable = false,
            length = 10
    )
    private String pincode;

    @Column(
            name = "country",
            nullable = false,
            length = 100
    )
    @Builder.Default
    private String country = "India";

    @Column(
            name = "latitude",
            precision = 10,
            scale = 7
    )
    private BigDecimal latitude;

    @Column(
            name = "longitude",
            precision = 10,
            scale = 7
    )
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "location_type",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private LocationType locationType = LocationType.MANUAL;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "address_type",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private AddressType addressType = AddressType.HOME;

    @Column(
            name = "is_default",
            nullable = false
    )
    @Builder.Default
    private boolean defaultAddress = false;

    public String getDistrict() {
        return taluk != null && taluk.getDistrict() != null
                ? taluk.getDistrict().getName()
                : null;
    }

    public String getState() {
        return taluk != null && taluk.getDistrict() != null && taluk.getDistrict().getState() != null
                ? taluk.getDistrict().getState().getName()
                : null;
    }
}