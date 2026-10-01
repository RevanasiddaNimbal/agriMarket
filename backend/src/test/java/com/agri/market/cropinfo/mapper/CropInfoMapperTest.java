package com.agri.market.cropinfo.mapper;

import com.agri.market.cropinfo.dto.CropInfoResponseDto;
import com.agri.market.cropinfo.dto.CropSummaryDto;
import com.agri.market.cropinfo.entity.CropInfo;
import com.agri.market.cropinfo.provider.AgricultureCropDataProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("CropInfoMapper")
class CropInfoMapperTest {

    @Mock
    private AgricultureCropDataProvider agricultureCropDataProvider;

    @InjectMocks
    private CropInfoMapper cropInfoMapper;

    @Nested
    @DisplayName("toResponseDto and toSummaryDto")
    class DtoMappingTests {

        @Test
        void shouldMapCropInfoToResponseDto() {
            final CropInfo entity = CropInfo.builder()
                    .id("crop-1")
                    .cropName("Rice")
                    .scientificName("Oryza sativa")
                    .description("Staple food grain")
                    .imageUrl("https://cloud.com/rice.jpg")
                    .lifeCycle("ANNUAL")
                    .growthStages("Seedling, Vegetative, Ripening")
                    .soilRequirements("Clay loam")
                    .waterRequirements("High")
                    .build();

            final CropInfoResponseDto dto = cropInfoMapper.toResponseDto(entity);

            assertThat(dto).isNotNull();
            assertThat(dto.getId()).isEqualTo("crop-1");
            assertThat(dto.getCropName()).isEqualTo("Rice");
            assertThat(dto.getScientificName()).isEqualTo("Oryza sativa");
            assertThat(dto.getGrowthStages()).isEqualTo("Seedling, Vegetative, Ripening");
        }

        @Test
        void shouldMapCropInfoToSummaryDto() {
            final CropInfo entity = CropInfo.builder()
                    .id("crop-1")
                    .cropName("Wheat")
                    .scientificName("Triticum")
                    .description("Winter crop")
                    .imageUrl("https://cloud.com/wheat.jpg")
                    .build();

            final CropSummaryDto dto = cropInfoMapper.toSummaryDto(entity);

            assertThat(dto).isNotNull();
            assertThat(dto.getId()).isEqualTo("crop-1");
            assertThat(dto.getCropName()).isEqualTo("Wheat");
            assertThat(dto.getScientificName()).isEqualTo("Triticum");
        }

        @Test
        void shouldReturnNullWhenEntityIsNull() {
            assertThat(cropInfoMapper.toResponseDto(null)).isNull();
            assertThat(cropInfoMapper.toSummaryDto(null)).isNull();
        }
    }
}
