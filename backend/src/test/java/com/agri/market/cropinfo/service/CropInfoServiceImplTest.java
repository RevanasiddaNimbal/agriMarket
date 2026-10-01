package com.agri.market.cropinfo.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSearchResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.entity.CropInfo;
import com.agri.market.cropinfo.mapper.CropInfoMapper;
import com.agri.market.cropinfo.model.PerenualPlantResponse;
import com.agri.market.cropinfo.provider.CropInfoProvider;
import com.agri.market.cropinfo.repository.CropInfoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("CropInfoServiceImpl")
class CropInfoServiceImplTest {

    @Mock
    private CropInfoRepository cropInfoRepository;

    @Mock
    private CropInfoProvider cropInfoProvider;

    @Mock
    private CropInfoMapper cropInfoMapper;

    @InjectMocks
    private CropInfoServiceImpl cropInfoService;

    @Nested
    @DisplayName("getFeaturedCrops")
    class GetFeaturedCropsTests {

        @Test
        void shouldReturnExistingFeaturedCropsWhenPresentInDatabase() {
            final CropInfo crop = CropInfo.builder().id("c1").cropName("Rice").build();
            final CropSummaryDto dto = CropSummaryDto.builder().id("c1").cropName("Rice").build();

            given(cropInfoRepository.findAll()).willReturn(List.of(crop));
            given(cropInfoMapper.toSummaryDto(crop)).willReturn(dto);

            final List<CropSummaryDto> result = cropInfoService.getFeaturedCrops();

            assertThat(result).containsExactly(dto);
        }

        @Test
        void shouldFetchFromProviderWhenDatabaseIsEmpty() {
            final PerenualPlantResponse plantResponse = new PerenualPlantResponse();
            plantResponse.setId(1);
            plantResponse.setCommon_name("Wheat");
            final CropInfo crop = CropInfo.builder().id("c1").cropName("Wheat").build();
            final CropSummaryDto dto = CropSummaryDto.builder().id("c1").cropName("Wheat").build();

            given(cropInfoRepository.findAll()).willReturn(List.of());
            given(cropInfoProvider.searchCrops("")).willReturn(List.of(plantResponse));
            given(cropInfoMapper.toEntity(plantResponse)).willReturn(crop);
            given(cropInfoRepository.saveAll(any())).willReturn(List.of(crop));
            given(cropInfoMapper.toSummaryDto(crop)).willReturn(dto);

            final List<CropSummaryDto> result = cropInfoService.getFeaturedCrops();

            assertThat(result).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("searchCrop")
    class SearchCropTests {

        @Test
        void shouldSearchStoredMatches() {
            final CropInfo crop = CropInfo.builder().id("c1").cropName("Tomato").build();
            final CropSummaryDto dto = CropSummaryDto.builder().id("c1").cropName("Tomato").build();

            given(cropInfoRepository.findAll()).willReturn(List.of(crop));
            given(cropInfoMapper.toSummaryDto(crop)).willReturn(dto);

            final CropSearchResponseDto result = cropInfoService.searchCrop("Tomato");

            assertThat(result.isFound()).isTrue();
            assertThat(result.getCrops()).containsExactly(dto);
        }

        @Test
        void shouldThrowExceptionWhenQueryIsBlank() {
            assertThatThrownBy(() -> cropInfoService.searchCrop(""))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }
    }

    @Nested
    @DisplayName("getCropById")
    class GetCropByIdTests {

        @Test
        void shouldReturnCropWhenFound() {
            final CropInfo crop = CropInfo.builder().id("c1").cropName("Corn").build();
            final CropInfoResponseDto dto = CropInfoResponseDto.builder().id("c1").cropName("Corn").build();

            given(cropInfoRepository.findById("c1")).willReturn(Optional.of(crop));
            given(cropInfoMapper.toResponseDto(crop)).willReturn(dto);

            final CropInfoResponseDto result = cropInfoService.getCropById("c1");

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenCropNotFound() {
            given(cropInfoRepository.findById("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> cropInfoService.getCropById("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.RESOURCE_NOT_FOUND);
        }
    }
}
