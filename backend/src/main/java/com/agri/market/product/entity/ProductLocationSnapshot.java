package com.agri.market.product.entity;

import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.agri.market.common.entity.BaseEntity;
import com.agri.market.location.entity.Taluk;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "product_location_snapshots")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductLocationSnapshot extends BaseEntity {

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
            name = "district",
            nullable = false,
            length = 100
    )
    private String district;

    @Column(
            name = "state",
            nullable = false,
            length = 100
    )
    private String state;

    @Column(
            name = "pincode",
            nullable = false,
            length = 10
    )
    @Builder.Default
    private String pincode = "580001";

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
    private AddressType addressType = AddressType.FARM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "taluk_id",
            foreignKey = @ForeignKey(name = "fk_product_location_snapshot_taluk")
    )
    private Taluk taluk;
}
