package com.agri.market.location.entity;

import com.agri.market.marketprice.entity.Market;
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
        name = "districts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_districts_state_name",
                        columnNames = {"state_id", "name"}
                ),
                @UniqueConstraint(
                        name = "uk_districts_state_code",
                        columnNames = {"state_id", "code"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_districts_state_id",
                        columnList = "state_id"
                ),
                @Index(
                        name = "idx_districts_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_districts_active",
                        columnList = "is_active"
                )
        }
)
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "state_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_districts_state")
    )
    private State state;

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
            mappedBy = "district",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Taluk> taluks = new ArrayList<>();

    @OneToMany(
            mappedBy = "district",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Market> markets = new ArrayList<>();
}