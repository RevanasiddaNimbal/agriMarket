package com.agri.market.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request parameters for searching and filtering users in the admin panel")
public class AdminUserSearchRequestDto {

    @Min(
            value = 0,
            message = "VALIDATION.ADMIN.USER.SEARCH.PAGE.MIN"
    )
    @Schema(
            description = "Zero-based page number",
            example = "0",
            defaultValue = "0",
            minimum = "0"
    )
    @Builder.Default
    private int page = 0;

    @Min(
            value = 1,
            message = "VALIDATION.ADMIN.USER.SEARCH.SIZE.MIN"
    )
    @Max(
            value = 100,
            message = "VALIDATION.ADMIN.USER.SEARCH.SIZE.MAX"
    )
    @Schema(
            description = "Number of users to return per page",
            example = "20",
            defaultValue = "20",
            minimum = "1",
            maximum = "100"
    )
    @Builder.Default
    private int size = 20;

    @Schema(
            description = "Search users by full name or email",
            example = "revanasidda"
    )
    private String search;

    @Schema(
            description = "Filter users by role name",
            example = "USER"
    )
    private String role;

    @Schema(
            description = "Filter users by enabled account status",
            example = "true"
    )
    private Boolean enabled;

    @Schema(
            description = "Filter users by account locked status",
            example = "false"
    )
    private Boolean accountLocked;

    @Schema(
            description = "Filter users by email verification status",
            example = "true"
    )
    private Boolean emailVerified;

    @Schema(
            description = "Filter users by phone verification status",
            example = "true"
    )
    private Boolean phoneVerified;
}