package com.agri.market.location.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.GenerationType.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "states",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_states_country_name",
                        columnNames = {"country_code", "name"}
                ),
                @UniqueConstraint(
                        name = "uk_states_country_code",
                        columnNames = {"country_code", "code"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_states_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_states_active",
                        columnList = "is_active"
                )
        }
)
public class State {

    @Id
    @GeneratedValue(strategy = UUID)
    @Column(nullable = false, updatable = false)
    private String id;

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
            name = "country_code",
            nullable = false,
            length = 2
    )
    private String countryCode = "IN";

    @Builder.Default
    @Column(
            name = "is_active",
            nullable = false
    )
    private boolean active = true;

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

    @OneToMany(
            mappedBy = "state",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<District> districts = new ArrayList<>();
}