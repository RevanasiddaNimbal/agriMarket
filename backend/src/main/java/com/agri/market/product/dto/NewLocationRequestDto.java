package com.agri.market.product.dto;

import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request data for providing a new product location")
public class NewLocationRequestDto {

    @JsonProperty("addressLine1")
    @Size(max = 200, message = "VALIDATION.ADDRESS.ADDRESS_LINE1.SIZE")
    @Schema(description = "Primary address line", example = "Navanagar")
    private String addressLine1;

    @JsonProperty("addressLine2")
    @Size(max = 200, message = "VALIDATION.ADDRESS.ADDRESS_LINE2.SIZE")
    @Schema(description = "Secondary address line", example = "Near Market")
    private String addressLine2;

    @JsonProperty("village")
    @Size(max = 100, message = "VALIDATION.ADDRESS.VILLAGE.SIZE")
    @Schema(description = "Village or locality name", example = "Amaragol")
    private String village;

    @JsonProperty("city")
    @Size(max = 100, message = "VALIDATION.ADDRESS.CITY.SIZE")
    @Schema(description = "City or town", example = "Amaragol")
    private String city;

    @JsonProperty("district")
    @Size(max = 100, message = "VALIDATION.ADDRESS.DISTRICT.SIZE")
    @Schema(description = "District name", example = "Dharwad")
    private String district;

    @JsonProperty("state")
    @Size(max = 100, message = "VALIDATION.ADDRESS.STATE.SIZE")
    @Schema(description = "State name", example = "Karnataka")
    private String state;

    @JsonProperty("country")
    @Size(max = 100, message = "VALIDATION.ADDRESS.COUNTRY.SIZE")
    @Builder.Default
    @Schema(description = "Country name", example = "India")
    private String country = "India";

    @JsonProperty("pincode")
    @Size(max = 10, message = "VALIDATION.ADDRESS.PINCODE.SIZE")
    @Schema(description = "Postal PIN code", example = "580025")
    private String pincode;

    @JsonProperty("latitude")
    @DecimalMin(value = "-90.0", message = "VALIDATION.ADDRESS.LATITUDE.RANGE")
    @DecimalMax(value = "90.0", message = "VALIDATION.ADDRESS.LATITUDE.RANGE")
    @Digits(integer = 3, fraction = 7, message = "VALIDATION.ADDRESS.LATITUDE.FORMAT")
    @Schema(description = "Latitude", example = "15.389007")
    private BigDecimal latitude;

    @JsonProperty("longitude")
    @DecimalMin(value = "-180.0", message = "VALIDATION.ADDRESS.LONGITUDE.RANGE")
    @DecimalMax(value = "180.0", message = "VALIDATION.ADDRESS.LONGITUDE.RANGE")
    @Digits(integer = 3, fraction = 7, message = "VALIDATION.ADDRESS.LONGITUDE.FORMAT")
    @Schema(description = "Longitude", example = "75.084641")
    private BigDecimal longitude;

    @JsonProperty("addressType")
    @Builder.Default
    @Schema(description = "Address type", example = "FARM")
    private AddressType addressType = AddressType.FARM;

    @JsonProperty("locationType")
    @Builder.Default
    @Schema(description = "Location type", example = "MAP")
    private LocationType locationType = LocationType.MAP;
}
