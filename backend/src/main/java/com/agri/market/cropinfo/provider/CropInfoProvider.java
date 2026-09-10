package com.agri.market.cropinfo.provider;

import com.agri.market.cropinfo.model.PerenualPlantResponse;

import java.util.List;

public interface CropInfoProvider {

    List<PerenualPlantResponse> searchCrops(String query);
}