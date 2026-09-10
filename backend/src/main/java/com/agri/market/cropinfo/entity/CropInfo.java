package com.agri.market.cropinfo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

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

    @Column(name = "soil_requirements", columnDefinition = "TEXT")
    private String soilRequirements;

    @Column(name = "water_requirements", columnDefinition = "TEXT")
    private String waterRequirements;

    @Column(name = "sunlight_requirements", columnDefinition = "TEXT")
    private String sunlightRequirements;

    @Column(name = "temperature_requirements", columnDefinition = "TEXT")
    private String temperatureRequirements;

    @Column(name = "common_pests", columnDefinition = "TEXT")
    private String commonPests;

    @Column(name = "common_diseases", columnDefinition = "TEXT")
    private String commonDiseases;

    @Column(name = "uses", columnDefinition = "TEXT")
    private String uses;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}