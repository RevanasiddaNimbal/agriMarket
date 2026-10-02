package com.agri.market.marketprice.entity;

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
        name = "commodities",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_commodities_name",
                        columnNames = {"name"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_commodities_name",
                        columnList = "name"
                )
        }
)
public class Commodity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name", nullable = false, length = 150, unique = true)
    private String name;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "commodity",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<MarketPrice> marketPrices = new ArrayList<>();
}
