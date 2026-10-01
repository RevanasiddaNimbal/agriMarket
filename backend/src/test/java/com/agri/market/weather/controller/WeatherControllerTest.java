package com.agri.market.weather.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.weather.dto.DailyWeatherResponseDto;
import com.agri.market.weather.dto.HourlyWeatherResponseDto;
import com.agri.market.weather.service.WeatherService;
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

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("WeatherController")
class WeatherControllerTest {

    private static final String BASE_URL = "/api/v1/weather";

    @Mock
    private WeatherService weatherService;

    @InjectMocks
    private WeatherController weatherController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(weatherController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getDailyWeather")
    class GetDailyWeatherTests {

        @Test
        void shouldReturnDailyWeather() throws Exception {
            final DailyWeatherResponseDto response = DailyWeatherResponseDto.builder()
                    .latitude(15.3647)
                    .longitude(75.1240)
                    .build();

            given(weatherService.getDailyWeather(15.3647, 75.1240)).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/daily")
                            .param("latitude", "15.3647")
                            .param("longitude", "75.1240"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(15.3647))
                    .andExpect(jsonPath("$.longitude").value(75.1240));
        }
    }

    @Nested
    @DisplayName("getHourlyWeather")
    class GetHourlyWeatherTests {

        @Test
        void shouldReturnHourlyWeather() throws Exception {
            final HourlyWeatherResponseDto response = HourlyWeatherResponseDto.builder()
                    .latitude(15.3647)
                    .longitude(75.1240)
                    .build();

            given(weatherService.getHourlyWeather(15.3647, 75.1240)).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/hourly")
                            .param("latitude", "15.3647")
                            .param("longitude", "75.1240"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(15.3647))
                    .andExpect(jsonPath("$.longitude").value(75.1240));
        }
    }
}
