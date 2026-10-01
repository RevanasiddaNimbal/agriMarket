package com.agri.market.weather.service;

import com.agri.market.weather.dto.DailyWeatherResponseDto;
import com.agri.market.weather.dto.HourlyWeatherResponseDto;
import com.agri.market.weather.provider.WeatherProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("WeatherServiceImpl")
class WeatherServiceImplTest {

    @Mock
    private WeatherProvider weatherProvider;

    @InjectMocks
    private WeatherServiceImpl weatherService;

    @Nested
    @DisplayName("getDailyWeather")
    class GetDailyWeatherTests {

        @Test
        void shouldReturnDailyWeatherSuccessfully() {
            final DailyWeatherResponseDto response = DailyWeatherResponseDto.builder()
                    .latitude(15.3647)
                    .longitude(75.1240)
                    .dailyForecast(List.of())
                    .build();

            given(weatherProvider.getDailyWeather(15.3647, 75.1240)).willReturn(response);

            final DailyWeatherResponseDto result = weatherService.getDailyWeather(15.3647, 75.1240);

            assertThat(result).isSameAs(response);
            then(weatherProvider).should().getDailyWeather(15.3647, 75.1240);
        }
    }

    @Nested
    @DisplayName("getHourlyWeather")
    class GetHourlyWeatherTests {

        @Test
        void shouldReturnHourlyWeatherSuccessfully() {
            final HourlyWeatherResponseDto response = HourlyWeatherResponseDto.builder()
                    .latitude(15.3647)
                    .longitude(75.1240)
                    .hourlyForecast(List.of())
                    .build();

            given(weatherProvider.getHourlyWeather(15.3647, 75.1240)).willReturn(response);

            final HourlyWeatherResponseDto result = weatherService.getHourlyWeather(15.3647, 75.1240);

            assertThat(result).isSameAs(response);
            then(weatherProvider).should().getHourlyWeather(15.3647, 75.1240);
        }
    }
}
