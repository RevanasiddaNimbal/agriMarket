package com.agri.market.weather.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.weather.dto.*;
import com.agri.market.weather.risk.FarmingRiskCalculator;
import com.agri.market.weather.risk.FarmingRiskLevel;
import com.agri.market.weather.risk.FarmingRiskType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("FarmingRiskServiceImpl")
class FarmingRiskServiceImplTest {

    @Mock
    private FarmingRiskCalculator farmingRiskCalculator;

    @InjectMocks
    private FarmingRiskServiceImpl farmingRiskService;

    @Nested
    @DisplayName("calculateDailyRisk")
    class CalculateDailyRiskTests {

        @Test
        void shouldCalculateDailyRiskSuccessfully() {
            final DailyWeatherDto weatherDto = DailyWeatherDto.builder()
                    .date("2026-09-29")
                    .maximumTemperatureCelsius(30.0)
                    .minimumTemperatureCelsius(20.0)
                    .precipitationProbabilityPercent(10.0)
                    .precipitationMillimeters(0.0)
                    .maximumWindSpeedKmh(15.0)
                    .maximumWindGustsKmh(20.0)
                    .uvIndexMax(5.0)
                    .build();

            final DailyWeatherRiskDto riskDto = DailyWeatherRiskDto.builder()
                    .weather(weatherDto)
                    .build();

            final RiskDetailDto detail = RiskDetailDto.builder()
                    .riskType(FarmingRiskType.RAINFALL)
                    .score(20)
                    .level(FarmingRiskLevel.LOW)
                    .build();

            given(farmingRiskCalculator.calculateRainfallRisk(anyDouble(), anyDouble())).willReturn(detail);
            given(farmingRiskCalculator.calculateWindRisk(anyDouble(), anyDouble())).willReturn(detail);
            given(farmingRiskCalculator.calculateHeatRisk(anyDouble(), any())).willReturn(detail);
            given(farmingRiskCalculator.calculateUvRisk(anyDouble())).willReturn(detail);
            given(farmingRiskCalculator.calculateSprayingRisk(any(), any(), any(), any(), any())).willReturn(detail);
            given(farmingRiskCalculator.calculateIrrigationRisk(any(), any(), any(), any(), any())).willReturn(detail);
            given(farmingRiskCalculator.calculateOverallRisk(any(), any(), any(), any(), any(), any())).willReturn(20);
            given(farmingRiskCalculator.calculateOverallRiskLevel(anyInt())).willReturn(FarmingRiskLevel.LOW);
            given(farmingRiskCalculator.buildOverallSummary(any(), any(), any(), any(), any(), any())).willReturn("Good conditions");
            given(farmingRiskCalculator.buildRecommendations(any(), any(), any(), any(), any(), any())).willReturn(List.of("Continue operations"));

            final FarmingRiskDto result = farmingRiskService.calculateDailyRisk(riskDto);

            assertThat(result).isNotNull();
            assertThat(result.getOverallRiskLevel()).isEqualTo(FarmingRiskLevel.LOW);
        }

        @Test
        void shouldThrowExceptionWhenDateDoesNotMatch() {
            final DailyWeatherDto weatherDto = DailyWeatherDto.builder()
                    .date("2026-09-29")
                    .build();

            final DailyWeatherRiskDto riskDto = DailyWeatherRiskDto.builder()
                    .weather(weatherDto)
                    .build();

            assertThatThrownBy(() -> farmingRiskService.calculateDailyRisk(LocalDate.of(2026, 9, 30), riskDto))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.WEATHER_DATE_INVALID);
        }
    }
}
