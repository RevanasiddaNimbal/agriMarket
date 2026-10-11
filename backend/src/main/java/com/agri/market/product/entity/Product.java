package com.agri.market.product.entity;

import com.agri.market.category.entity.Category;
import com.agri.market.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "products",
        indexes = {
                @Index(
                        name = "idx_products_farmer_id",
                        columnList = "farmer_id"
                ),
                @Index(
                        name = "idx_products_category_id",
                        columnList = "category_id"
                ),
                @Index(
                        name = "idx_products_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_products_location_snapshot_id",
                        columnList = "product_location_snapshot_id"
                )
        }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "farmer_id",
            nullable = false
    )
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false
    )
    private Category category;

    @Column(
            nullable = false,
            length = 150
    )
    private String name;

    @Column(
            nullable = false,
            length = 2000
    )
    private String description;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal price;

    @Column(
            nullable = false,
            length = 50
    )
    private String unit;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(
            name = "product_location_snapshot_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_products_location_snapshot")
    )
    private ProductLocationSnapshot locationSnapshot;

    @Column(
            nullable = false,
            length = 20
    )
    private String status;

    @OneToMany(
            mappedBy = "product",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @CreatedDate
    @Column(
            name = "created_date",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(
            name = "last_modified_date",
            nullable = false
    )
    private LocalDateTime lastModifiedDate;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ProductStatus.ACTIVE.name();
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdDate = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return lastModifiedDate;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.lastModifiedDate = updatedAt;
    }

    public String getLocation() {
        if (locationSnapshot == null) {
            return null;
        }
        if (locationSnapshot.getCity() != null) {
            return locationSnapshot.getCity();
        }
        return locationSnapshot.getAddressLine1();
    }
}