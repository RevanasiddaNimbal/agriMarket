package com.agri.market.inventory.entity;

import com.agri.market.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "inventory",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_inventory_product",
                        columnNames = "product_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_inventory_product_id",
                        columnList = "product_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_inventory_product")
    )
    private Product product;

    @Column(
            name = "total_quantity",
            nullable = false,
            precision = 19,
            scale = 3
    )
    @Builder.Default
    private BigDecimal totalQuantity = BigDecimal.ZERO;

    @Column(
            name = "reserved_quantity",
            nullable = false,
            precision = 19,
            scale = 3
    )
    @Builder.Default
    private BigDecimal reservedQuantity = BigDecimal.ZERO;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }

        if (totalQuantity == null) {
            totalQuantity = BigDecimal.ZERO;
        }

        if (reservedQuantity == null) {
            reservedQuantity = BigDecimal.ZERO;
        }

        if (version == null) {
            version = 0L;
        }

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

