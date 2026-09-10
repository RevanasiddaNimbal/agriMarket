package com.agri.market.cropinfo.controller;

import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSearchResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.service.CropInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/crops/info")
@RequiredArgsConstructor
@Tag(name = "Crop Information")
public class CropInfoController {

    private final CropInfoService cropInfoService;

    @GetMapping
    @Operation(summary = "Get featured crop information")
    public ResponseEntity<List<CropSummaryDto>> getFeaturedCrops() {
        return ResponseEntity.ok(
                cropInfoService.getFeaturedCrops()
        );
    }

    @GetMapping("/search")
    @Operation(summary = "Search crop information")
    public ResponseEntity<CropSearchResponseDto> searchCrop(
            @RequestParam
            @NotBlank
            String query
    ) {
        return ResponseEntity.ok(
                cropInfoService.searchCrop(query)
        );
    }

    @GetMapping("/{cropId}")
    @Operation(summary = "Get detailed crop information")
    public ResponseEntity<CropInfoResponseDto> getCropById(
            @PathVariable String cropId
    ) {
        return ResponseEntity.ok(
                cropInfoService.getCropById(cropId)
        );
    }
}