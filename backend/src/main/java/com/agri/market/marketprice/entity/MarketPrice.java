package com.agri.market.marketprice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "market_prices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_market_price_unique",
                        columnNames = {"commodity_id", "market_id", "arrival_date"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_market_price_commodity_id",
                        columnList = "commodity_id"
                ),
                @Index(
                        name = "idx_market_price_market_id",
                        columnList = "market_id"
                ),
                @Index(
                        name = "idx_market_price_arrival_date",
                        columnList = "arrival_date"
                )
        }
)
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "commodity_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_market_prices_commodity")
    )
    private Commodity commodity;

    @Column(name = "variety", length = 150)
    private String variety;

    @Column(name = "grade", length = 100)
    private String grade;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "market_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_market_prices_market")
    )
    private Market market;

    @Column(
            name = "minimum_price",
            precision = 12,
            scale = 2
    )
    private BigDecimal minimumPrice;

    @Column(
            name = "maximum_price",
            precision = 12,
            scale = 2
    )
    private BigDecimal maximumPrice;

    @Column(
            name = "modal_price",
            precision = 12,
            scale = 2
    )
    private BigDecimal modalPrice;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "arrival_date", nullable = false)
    private LocalDate arrivalDate;

    @Column(name = "source", nullable = false, length = 100)
    private String source;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}