package com.agri.market.location.entity;

import com.agri.market.address.entity.Address;
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
        name = "taluks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_taluks_district_name",
                        columnNames = {"district_id", "name"}
                ),
                @UniqueConstraint(
                        name = "uk_taluks_district_code",
                        columnNames = {"district_id", "code"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_taluks_district_id",
                        columnList = "district_id"
                ),
                @Index(
                        name = "idx_taluks_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_taluks_active",
                        columnList = "is_active"
                )
        }
)
public class Taluk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "district_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_taluks_district")
    )
    private District district;

    @Column(
            name = "name",
            nullable = false,
            length = 100
    )
    private String name;

    @Column(
            name = "code",
            nullable = false,
            length = 20
    )
    private String code;

    @Builder.Default
    @Column(
            name = "is_active",
            nullable = false
    )
    private boolean active = true;

    @CreatedDate
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "taluk",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();
}