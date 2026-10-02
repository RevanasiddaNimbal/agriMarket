package com.agri.market.product.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request data used to create or update a product")
public class ProductRequestDto {

    @JsonProperty("category_id")
    @JsonAlias({"categoryId", "category_id"})
    @NotBlank(message = "VALIDATION.PRODUCT.CATEGORY_ID.NOT_BLANK")
    @Schema(
            description = "Identifier of the product category",
            example = "550e8400-e29b-41d4-a716-446655440001",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String categoryId;

    @JsonProperty("name")
    @NotBlank(message = "VALIDATION.PRODUCT.NAME.NOT_BLANK")
    @Size(
            min = 2,
            max = 150,
            message = "VALIDATION.PRODUCT.NAME.SIZE"
    )
    @Schema(
            description = "Product name",
            example = "Premium Wheat Seeds",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;

    @JsonProperty("description")
    @NotBlank(message = "VALIDATION.PRODUCT.DESCRIPTION.NOT_BLANK")
    @Size(
            min = 10,
            max = 2000,
            message = "VALIDATION.PRODUCT.DESCRIPTION.SIZE"
    )
    @Schema(
            description = "Detailed product description",
            example = "High quality wheat seeds suitable for winter cultivation",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String description;

    @JsonProperty("price")
    @NotNull(message = "VALIDATION.PRODUCT.PRICE.NOT_NULL")
    @DecimalMin(
            value = "0.01",
            message = "VALIDATION.PRODUCT.PRICE.MIN"
    )
    @Schema(
            description = "Product price per unit",
            example = "850.00",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private BigDecimal price;

    @JsonProperty("unit")
    @NotBlank(message = "VALIDATION.PRODUCT.UNIT.NOT_BLANK")
    @Size(
            max = 50,
            message = "VALIDATION.PRODUCT.UNIT.SIZE"
    )
    @Schema(
            description = "Unit in which the product is sold",
            example = "KG",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String unit;

    @JsonProperty("quantity")
    @NotNull(message = "VALIDATION.PRODUCT.QUANTITY.NOT_NULL")
    @DecimalMin(
            value = "0.01",
            message = "VALIDATION.PRODUCT.QUANTITY.MIN"
    )
    @Schema(
            description = "Available product quantity",
            example = "500.00",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private BigDecimal quantity;

    @JsonProperty("saved_address_id")
    @JsonAlias({"savedAddressId", "saved_address_id"})
    @Schema(
            description = "Identifier of an existing saved address",
            example = "550e8400-e29b-41d4-a716-446655440002"
    )
    private String savedAddressId;

    @JsonProperty("new_location")
    @JsonAlias({"newLocation", "new_location"})
    @Valid
    @Schema(
            description = "Details of a new product location"
    )
    private NewLocationRequestDto newLocation;

    @JsonProperty("location")
    @Size(
            max = 100,
            message = "VALIDATION.PRODUCT.LOCATION.SIZE"
    )
    @Schema(
            description = "Legacy string location",
            example = "Vijayapura"
    )
    private String location;
}