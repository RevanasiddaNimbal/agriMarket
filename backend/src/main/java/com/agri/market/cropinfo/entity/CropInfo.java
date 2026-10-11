package com.agri.market.cropinfo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "crop_info",
        indexes = {
                @Index(name = "idx_crop_info_name", columnList = "crop_name"),
                @Index(name = "idx_crop_info_scientific_name", columnList = "scientific_name")
        }
)
public class CropInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private String id;

    @Column(name = "crop_name", nullable = false, unique = true, length = 100)
    private String cropName;

    @Column(name = "scientific_name", length = 150)
    private String scientificName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "life_cycle", columnDefinition = "TEXT")
    private String lifeCycle;

    @Column(name = "growth_stages", columnDefinition = "TEXT")
    private String growthStages;

    @Column(name = "sowing_info", columnDefinition = "TEXT")
    private String sowingInfo;

    @Column(name = "growing_duration", length = 100)
    private String growingDuration;

    @Column(name = "harvesting_info", columnDefinition = "TEXT")
    private String harvestingInfo;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop_info_soil_requirements",
            joinColumns = @JoinColumn(
                    name = "crop_info_id",
                    foreignKey = @ForeignKey(name = "fk_crop_info_soil_requirements_crop")
            )
    )
    @Column(name = "requirement", nullable = false, columnDefinition = "TEXT")
    @OrderBy("requirement ASC")
    @Builder.Default
    private Set<String> soilRequirements = new LinkedHashSet<>();

    @Column(name = "water_requirements", columnDefinition = "TEXT")
    private String waterRequirements;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop_info_sunlight_requirements",
            joinColumns = @JoinColumn(
                    name = "crop_info_id",
                    foreignKey = @ForeignKey(name = "fk_crop_info_sunlight_requirements_crop")
            )
    )
    @Column(name = "requirement", nullable = false, columnDefinition = "TEXT")
    @OrderBy("requirement ASC")
    @Builder.Default
    private Set<String> sunlightRequirements = new LinkedHashSet<>();

    @Column(name = "temperature_requirements", columnDefinition = "TEXT")
    private String temperatureRequirements;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop_info_common_pests",
            joinColumns = @JoinColumn(
                    name = "crop_info_id",
                    foreignKey = @ForeignKey(name = "fk_crop_info_common_pests_crop")
            )
    )
    @Column(name = "pest", nullable = false, columnDefinition = "TEXT")
    @OrderBy("pest ASC")
    @Builder.Default
    private Set<String> commonPests = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop_info_common_diseases",
            joinColumns = @JoinColumn(
                    name = "crop_info_id",
                    foreignKey = @ForeignKey(name = "fk_crop_info_common_diseases_crop")
            )
    )
    @Column(name = "disease", nullable = false, columnDefinition = "TEXT")
    @OrderBy("disease ASC")
    @Builder.Default
    private Set<String> commonDiseases = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop_info_uses",
            joinColumns = @JoinColumn(
                    name = "crop_info_id",
                    foreignKey = @ForeignKey(name = "fk_crop_info_uses_crop")
            )
    )
    @Column(name = "use_case", nullable = false, columnDefinition = "TEXT")
    @OrderBy("use_case ASC")
    @Builder.Default
    private Set<String> uses = new LinkedHashSet<>();

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
}