package com.agri.market.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product information")
public class ProductResponseDto {

    @JsonProperty("id")
    @Schema(
            description = "Unique identifier of the product",
            example = "550e8400-e29b-41d4-a716-446655440001"
    )
    private String id;

    @JsonProperty("farmer_id")
    @Schema(
            description = "Identifier of the farmer who owns the product",
            example = "550e8400-e29b-41d4-a716-446655440002"
    )
    private String farmerId;

    @JsonProperty("farmer_name")
    @Schema(
            description = "Full name of the farmer who owns the product",
            example = "Revanasidda Nimbal"
    )
    private String farmerName;

    @JsonProperty("category_id")
    @Schema(
            description = "Identifier of the product category",
            example = "550e8400-e29b-41d4-a716-446655440003"
    )
    private String categoryId;

    @JsonProperty("category_name")
    @Schema(
            description = "Product category name",
            example = "Seeds"
    )
    private String categoryName;

    @JsonProperty("name")
    @Schema(
            description = "Product name",
            example = "Premium Wheat Seeds"
    )
    private String name;

    @JsonProperty("description")
    @Schema(
            description = "Detailed product description",
            example = "High quality wheat seeds suitable for winter cultivation"
    )
    private String description;

    @JsonProperty("price")
    @Schema(
            description = "Product price per unit",
            example = "850.00"
    )
    private BigDecimal price;

    @JsonProperty("unit")
    @Schema(
            description = "Unit in which the product is sold",
            example = "KG"
    )
    private String unit;

    @JsonProperty("quantity")
    @Schema(
            description = "Available product quantity",
            example = "500.00"
    )
    private BigDecimal quantity;

    @JsonProperty("location")
    @Schema(
            description = "Product location",
            example = "Vijayapura"
    )
    private String location;

    @JsonProperty("status")
    @Schema(
            description = "Current product status",
            example = "ACTIVE"
    )
    private String status;

    @JsonProperty("images")
    @Schema(
            description = "Images associated with the product"
    )
    @Builder.Default
    private List<ProductImageResponseDto> images = List.of();

    @JsonProperty("created_at")
    @Schema(
            description = "Product creation timestamp",
            example = "2026-08-28T10:30:00"
    )
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Schema(
            description = "Product last update timestamp",
            example = "2026-08-28T10:30:00"
    )
    private LocalDateTime updatedAt;
}