package com.agri.market.weather.provider;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.weather.config.WeatherProperties;
import com.agri.market.weather.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenMeteoWeatherProvider implements WeatherProvider {

    private static final String TIMEZONE = "auto";

    private final WeatherProperties weatherProperties;
    private final RestClient openMeteoRestClient;

    @Override
    public DailyWeatherResponseDto getDailyWeather(
            double latitude,
            double longitude
    ) {
        validateCoordinates(latitude, longitude);

        log.info(
                "Fetching daily weather from Open-Meteo: latitude={}, longitude={}",
                latitude,
                longitude
        );

        try {
            OpenMeteoDailyResponse response = openMeteoRestClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("timezone", TIMEZONE)
                            .queryParam(
                                    "forecast_days",
                                    weatherProperties.getForecastDays()
                            )
                            .queryParam(
                                    "daily",
                                    String.join(
                                            ",",
                                            "temperature_2m_min",
                                            "temperature_2m_max",
                                            "apparent_temperature_max",
                                            "precipitation_probability_max",
                                            "precipitation_sum",
                                            "rain_sum",
                                            "weather_code",
                                            "wind_speed_10m_max",
                                            "wind_gusts_10m_max",
                                            "wind_direction_10m_dominant",
                                            "uv_index_max",
                                            "et0_fao_evapotranspiration",
                                            "sunshine_duration",
                                            "sunrise",
                                            "sunset"
                                    )
                            )
                            .build()
                    )
                    .retrieve()
                    .body(OpenMeteoDailyResponse.class);

            if (response == null || response.getDaily() == null) {
                log.error(
                        "Open-Meteo returned an empty daily weather response: latitude={}, longitude={}",
                        latitude,
                        longitude
                );

                throw new BusinessException(
                        ErrorCode.WEATHER_DATA_UNAVAILABLE
                );
            }

            DailyWeatherResponseDto result =
                    mapDailyResponse(response);

            log.info(
                    "Daily weather retrieved successfully: latitude={}, longitude={}, days={}",
                    latitude,
                    longitude,
                    result.getDailyForecast() != null
                            ? result.getDailyForecast().size()
                            : 0
            );

            return result;

        } catch (BusinessException exception) {

            throw exception;

        } catch (RestClientException exception) {

            log.error(
                    "Open-Meteo daily weather request failed: latitude={}, longitude={}, error={}",
                    latitude,
                    longitude,
                    exception.getMessage(),
                    exception
            );

            throw new BusinessException(
                    ErrorCode.WEATHER_PROVIDER_UNAVAILABLE
            );

        } catch (Exception exception) {

            log.error(
                    "Unexpected error processing Open-Meteo daily response: latitude={}, longitude={}, error={}",
                    latitude,
                    longitude,
                    exception.getMessage(),
                    exception
            );

            throw new BusinessException(
                    ErrorCode.WEATHER_RESPONSE_INVALID
            );
        }
    }

    @Override
    public HourlyWeatherResponseDto getHourlyWeather(
            double latitude,
            double longitude
    ) {
        validateCoordinates(latitude, longitude);

        log.info(
                "Fetching hourly weather from Open-Meteo: latitude={}, longitude={}",
                latitude,
                longitude
        );

        try {
            OpenMeteoHourlyResponse response = openMeteoRestClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("timezone", TIMEZONE)
                            .queryParam(
                                    "forecast_days",
                                    weatherProperties.getForecastDays()
                            )
                            .queryParam(
                                    "hourly",
                                    String.join(
                                            ",",
                                            "temperature_2m",
                                            "apparent_temperature",
                                            "relative_humidity_2m",
                                            "precipitation_probability",
                                            "precipitation",
                                            "rain",
                                            "weather_code",
                                            "wind_speed_10m",
                                            "wind_gusts_10m",
                                            "wind_direction_10m",
                                            "uv_index",
                                            "et0_fao_evapotranspiration",
                                            "soil_temperature_0cm",
                                            "soil_moisture_0_to_1cm"
                                    )
                            )
                            .build()
                    )
                    .retrieve()
                    .body(OpenMeteoHourlyResponse.class);

            if (response == null || response.getHourly() == null) {
                log.error(
                        "Open-Meteo returned an empty hourly weather response: latitude={}, longitude={}",
                        latitude,
                        longitude
                );

                throw new BusinessException(
                        ErrorCode.WEATHER_DATA_UNAVAILABLE
                );
            }

            HourlyWeatherResponseDto result =
                    mapHourlyResponse(response);

            log.info(
                    "Hourly weather retrieved successfully: latitude={}, longitude={}, hours={}",
                    latitude,
                    longitude,
                    result.getHourlyForecast() != null
                            ? result.getHourlyForecast().size()
                            : 0
            );

            return result;

        } catch (BusinessException exception) {

            throw exception;

        } catch (RestClientException exception) {

            log.error(
                    "Open-Meteo hourly weather request failed: latitude={}, longitude={}, error={}",
                    latitude,
                    longitude,
                    exception.getMessage(),
                    exception
            );

            throw new BusinessException(
                    ErrorCode.WEATHER_PROVIDER_UNAVAILABLE
            );

        } catch (Exception exception) {

            log.error(
                    "Unexpected error processing Open-Meteo hourly response: latitude={}, longitude={}, error={}",
                    latitude,
                    longitude,
                    exception.getMessage(),
                    exception
            );

            throw new BusinessException(
                    ErrorCode.WEATHER_RESPONSE_INVALID
            );
        }
    }

    private DailyWeatherResponseDto mapDailyResponse(
            OpenMeteoDailyResponse response
    ) {
        OpenMeteoDailyResponse.OpenMeteoDailyData daily =
                response.getDaily();

        List<String> times = daily.getTime();

        if (times == null || times.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.WEATHER_DATA_UNAVAILABLE
            );
        }

        List<DailyWeatherDto> forecasts =
                new ArrayList<>();

        for (int index = 0; index < times.size(); index++) {

            int weatherCode =
                    getInt(daily.getWeatherCode(), index);

            forecasts.add(
                    DailyWeatherDto.builder()
                            .date(
                                    getValue(
                                            daily.getTime(),
                                            index
                                    )
                            )
                            .minimumTemperatureCelsius(
                                    getDouble(
                                            daily.getTemperature2mMin(),
                                            index
                                    )
                            )
                            .maximumTemperatureCelsius(
                                    getDouble(
                                            daily.getTemperature2mMax(),
                                            index
                                    )
                            )
                            .apparentTemperatureCelsius(
                                    getDouble(
                                            daily.getApparentTemperatureMax(),
                                            index
                                    )
                            )
                            .precipitationProbabilityPercent(
                                    getInt(
                                            daily.getPrecipitationProbabilityMax(),
                                            index
                                    )
                            )
                            .precipitationMillimeters(
                                    getDouble(
                                            daily.getPrecipitationSum(),
                                            index
                                    )
                            )
                            .rainMillimeters(
                                    getDouble(
                                            daily.getRainSum(),
                                            index
                                    )
                            )
                            .weatherCode(weatherCode)
                            .weatherCondition(
                                    weatherCodeToCondition(
                                            weatherCode
                                    )
                            )
                            .maximumWindSpeedKmh(
                                    getDouble(
                                            daily.getWindSpeed10mMax(),
                                            index
                                    )
                            )
                            .maximumWindGustsKmh(
                                    getDouble(
                                            daily.getWindGusts10mMax(),
                                            index
                                    )
                            )
                            .dominantWindDirectionDegrees(
                                    getDouble(
                                            daily.getWindDirection10mDominant(),
                                            index
                                    )
                            )
                            .uvIndexMax(
                                    getDouble(
                                            daily.getUvIndexMax(),
                                            index
                                    )
                            )
                            .evapotranspirationMillimeters(
                                    getDouble(
                                            daily.getEt0FaoEvapotranspiration(),
                                            index
                                    )
                            )
                            .sunshineDurationHours(
                                    getDouble(
                                            daily.getSunshineDuration(),
                                            index
                                    ) / 3600.0
                            )
                            .sunrise(
                                    getValue(
                                            daily.getSunrise(),
                                            index
                                    )
                            )
                            .sunset(
                                    getValue(
                                            daily.getSunset(),
                                            index
                                    )
                            )
                            .build()
            );
        }

        return DailyWeatherResponseDto.builder()
                .latitude(response.getLatitude())
                .longitude(response.getLongitude())
                .timezone(response.getTimezone())
                .dailyForecast(forecasts)
                .build();
    }

    private HourlyWeatherResponseDto mapHourlyResponse(
            OpenMeteoHourlyResponse response
    ) {
        OpenMeteoHourlyResponse.OpenMeteoHourlyData hourly =
                response.getHourly();

        List<String> times = hourly.getTime();

        if (times == null || times.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.WEATHER_DATA_UNAVAILABLE
            );
        }

        List<HourlyWeatherDto> forecasts =
                new ArrayList<>();

        for (int index = 0; index < times.size(); index++) {

            int weatherCode =
                    getInt(hourly.getWeatherCode(), index);

            forecasts.add(
                    HourlyWeatherDto.builder()
                            .time(
                                    getValue(
                                            hourly.getTime(),
                                            index
                                    )
                            )
                            .temperatureCelsius(
                                    getDouble(
                                            hourly.getTemperature2m(),
                                            index
                                    )
                            )
                            .apparentTemperatureCelsius(
                                    getDouble(
                                            hourly.getApparentTemperature(),
                                            index
                                    )
                            )
                            .relativeHumidityPercent(
                                    getDouble(
                                            hourly.getRelativeHumidity2m(),
                                            index
                                    )
                            )
                            .precipitationProbabilityPercent(
                                    getInt(
                                            hourly.getPrecipitationProbability(),
                                            index
                                    )
                            )
                            .precipitationMillimeters(
                                    getDouble(
                                            hourly.getPrecipitation(),
                                            index
                                    )
                            )
                            .rainMillimeters(
                                    getDouble(
                                            hourly.getRain(),
                                            index
                                    )
                            )
                            .weatherCode(weatherCode)
                            .weatherCondition(
                                    weatherCodeToCondition(
                                            weatherCode
                                    )
                            )
                            .windSpeedKmh(
                                    getDouble(
                                            hourly.getWindSpeed10m(),
                                            index
                                    )
                            )
                            .windGustsKmh(
                                    getDouble(
                                            hourly.getWindGusts10m(),
                                            index
                                    )
                            )
                            .windDirectionDegrees(
                                    getDouble(
                                            hourly.getWindDirection10m(),
                                            index
                                    )
                            )
                            .uvIndex(
                                    getDouble(
                                            hourly.getUvIndex(),
                                            index
                                    )
                            )
                            .evapotranspirationMillimeters(
                                    getDouble(
                                            hourly.getEt0FaoEvapotranspiration(),
                                            index
                                    )
                            )
                            .soilTemperatureCelsius(
                                    getDouble(
                                            hourly.getSoilTemperature0cm(),
                                            index
                                    )
                            )
                            .soilMoisture(
                                    getDouble(
                                            hourly.getSoilMoisture0To1cm(),
                                            index
                                    )
                            )
                            .build()
            );
        }

        return HourlyWeatherResponseDto.builder()
                .latitude(response.getLatitude())
                .longitude(response.getLongitude())
                .timezone(response.getTimezone())
                .hourlyForecast(forecasts)
                .build();
    }

    private String getValue(
            List<String> values,
            int index
    ) {
        if (values == null
                || index < 0
                || index >= values.size()) {
            return null;
        }

        return values.get(index);
    }

    private int getInt(
            List<Integer> values,
            int index
    ) {
        if (values == null
                || index < 0
                || index >= values.size()
                || values.get(index) == null) {
            return 0;
        }

        return values.get(index);
    }

    private double getDouble(
            List<Double> values,
            int index
    ) {
        if (values == null
                || index < 0
                || index >= values.size()
                || values.get(index) == null) {
            return 0.0;
        }

        return values.get(index);
    }

    private void validateCoordinates(
            double latitude,
            double longitude
    ) {
        if (latitude < -90
                || latitude > 90
                || longitude < -180
                || longitude > 180) {

            log.warn(
                    "Invalid weather coordinates: latitude={}, longitude={}",
                    latitude,
                    longitude
            );

            throw new BusinessException(
                    ErrorCode.WEATHER_INVALID_COORDINATES
            );
        }
    }

    private String weatherCodeToCondition(
            int weatherCode
    ) {
        return switch (weatherCode) {
            case 0 -> "Clear sky";
            case 1 -> "Mainly clear";
            case 2 -> "Partly cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Fog";
            case 51, 53, 55 -> "Drizzle";
            case 56, 57 -> "Freezing drizzle";
            case 61, 63, 65 -> "Rain";
            case 66, 67 -> "Freezing rain";
            case 71, 73, 75 -> "Snow fall";
            case 77 -> "Snow grains";
            case 80, 81, 82 -> "Rain showers";
            case 85, 86 -> "Snow showers";
            case 95 -> "Thunderstorm";
            case 96, 99 -> "Thunderstorm with hail";
            default -> "Unknown weather condition";
        };
    }
}