package com.agri.market.cropinfo.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSearchResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.service.CropInfoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("CropInfoController")
class CropInfoControllerTest {

    private static final String BASE_URL = "/api/v1/crops/info";

    @Mock
    private CropInfoService cropInfoService;

    @InjectMocks
    private CropInfoController cropInfoController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(cropInfoController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getFeaturedCrops")
    class GetFeaturedCropsTests {

        @Test
        void shouldReturnFeaturedCrops() throws Exception {
            final CropSummaryDto dto = CropSummaryDto.builder()
                    .id("crop-1")
                    .cropName("Wheat")
                    .build();

            given(cropInfoService.getFeaturedCrops()).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("crop-1"))
                    .andExpect(jsonPath("$[0].cropName").value("Wheat"));
        }
    }

    @Nested
    @DisplayName("searchCrop")
    class SearchCropTests {

        @Test
        void shouldSearchCropSuccessfully() throws Exception {
            final CropSearchResponseDto response = CropSearchResponseDto.builder()
                    .found(true)
                    .query("Rice")
                    .build();

            given(cropInfoService.searchCrop("Rice")).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/search").param("query", "Rice"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.found").value(true))
                    .andExpect(jsonPath("$.query").value("Rice"));
        }
    }

    @Nested
    @DisplayName("getCropById")
    class GetCropByIdTests {

        @Test
        void shouldGetCropById() throws Exception {
            final CropInfoResponseDto dto = CropInfoResponseDto.builder()
                    .id("crop-1")
                    .cropName("Corn")
                    .build();

            given(cropInfoService.getCropById("crop-1")).willReturn(dto);

            mockMvc.perform(get(BASE_URL + "/{cropId}", "crop-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("crop-1"))
                    .andExpect(jsonPath("$.cropName").value("Corn"));
        }
    }
}
