package com.agri.market.weather.risk;

import com.agri.market.weather.dto.RiskDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FarmingRiskCalculator")
class FarmingRiskCalculatorTest {

    private FarmingRiskCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new FarmingRiskCalculator();
    }

    @Test
    void shouldDetermineCorrectRiskLevels() {
        assertThat(calculator.determineRiskLevel(15)).isEqualTo(FarmingRiskLevel.LOW);
        assertThat(calculator.determineRiskLevel(40)).isEqualTo(FarmingRiskLevel.MODERATE);
        assertThat(calculator.determineRiskLevel(65)).isEqualTo(FarmingRiskLevel.HIGH);
        assertThat(calculator.determineRiskLevel(90)).isEqualTo(FarmingRiskLevel.VERY_HIGH);
    }

    @Test
    void shouldCalculateRainfallRiskCorrectly() {
        final RiskDetailDto risk = calculator.calculateRainfallRisk(80.0, 25.0);

        assertThat(risk).isNotNull();
        assertThat(risk.getRiskType()).isEqualTo(FarmingRiskType.RAINFALL);
        assertThat(risk.getScore()).isGreaterThan(50);
        assertThat(risk.getLevel()).isIn(FarmingRiskLevel.HIGH, FarmingRiskLevel.VERY_HIGH);
    }

    @Test
    void shouldCalculateWindRiskCorrectly() {
        final RiskDetailDto lowWind = calculator.calculateWindRisk(10.0, 15.0);
        assertThat(lowWind.getLevel()).isEqualTo(FarmingRiskLevel.LOW);

        final RiskDetailDto highWind = calculator.calculateWindRisk(50.0, 70.0);
        assertThat(highWind.getLevel()).isIn(FarmingRiskLevel.HIGH, FarmingRiskLevel.VERY_HIGH);
    }
}
