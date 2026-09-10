package com.agri.market.cropinfo.service;

import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSearchResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;

import java.util.List;

public interface CropInfoService {

    List<CropSummaryDto> getFeaturedCrops();

    CropSearchResponseDto searchCrop(String query);

    CropInfoResponseDto getCropById(String cropId);
}