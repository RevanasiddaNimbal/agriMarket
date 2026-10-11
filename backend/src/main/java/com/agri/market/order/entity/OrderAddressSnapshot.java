package com.agri.market.order.entity;

import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.agri.market.common.entity.BaseEntity;
import com.agri.market.location.entity.Taluk;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
        name = "order_address_snapshots",
        indexes = {
                @Index(
                        name = "idx_order_address_snapshots_order_id",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_order_address_snapshots_taluk_id",
                        columnList = "taluk_id"
                )
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderAddressSnapshot extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_order_address_snapshot_order")
    )
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "taluk_id",
            foreignKey = @ForeignKey(name = "fk_order_address_snapshot_taluk")
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

    public String getDistrict() {
        return taluk != null && taluk.getDistrict() != null ? taluk.getDistrict().getName() : null;
    }

    public String getState() {
        return taluk != null && taluk.getDistrict() != null && taluk.getDistrict().getState() != null
                ? taluk.getDistrict().getState().getName()
                : null;
    }
}
