package com.agri.market.weather.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(WeatherProperties.class)
@RequiredArgsConstructor
public class WeatherConfig {

    private final WeatherProperties weatherProperties;

    @Bean
    public RestClient openMeteoRestClient() {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(
                weatherProperties.getConnectTimeoutSeconds() * 1000
        );

        requestFactory.setReadTimeout(
                weatherProperties.getReadTimeoutSeconds() * 1000
        );

        return RestClient.builder()
                .baseUrl(weatherProperties.getBaseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}