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
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "last_modified_date", nullable = false)
    private LocalDateTime lastModifiedDate;

    @OneToMany(
            mappedBy = "commodity",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<MarketPrice> marketPrices = new ArrayList<>();
}
