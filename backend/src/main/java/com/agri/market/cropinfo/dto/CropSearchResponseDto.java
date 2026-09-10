package com.agri.market.cropinfo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Crop search response")
public class CropSearchResponseDto {

    @Schema(
            description = "Whether a matching crop was found",
            example = "true"
    )
    private boolean found;

    @Schema(
            description = "Original search query",
            example = "tomato"
    )
    private String query;

    @Schema(description = "Matching crop information")
    private List<CropSummaryDto> crops;

    @Schema(description = "Total number of returned crops")
    private int total;

    @Schema(
            description = "Response message",
            example = "Crop information found successfully"
    )
    private String message;
}