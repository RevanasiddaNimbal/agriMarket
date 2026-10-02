package com.agri.market.marketprice.entity;

import com.agri.market.location.entity.District;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "markets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_markets_district_name",
                        columnNames = {"district_id", "name"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_markets_district_id",
                        columnList = "district_id"
                ),
                @Index(
                        name = "idx_markets_name",
                        columnList = "name"
                )
        }
)
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "district_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_markets_district")
    )
    private District district;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "market",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<MarketPrice> marketPrices = new ArrayList<>();
}
