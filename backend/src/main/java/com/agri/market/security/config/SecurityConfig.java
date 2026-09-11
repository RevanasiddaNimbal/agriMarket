package com.agri.market.security.config;

import com.agri.market.auth.properties.AuthenticationCookieProperties;
import com.agri.market.auth.properties.LoginAttemptProperties;
import com.agri.market.password.properties.PasswordSecurityProperties;
import com.agri.market.security.handler.RestAccessDeniedHandler;
import com.agri.market.security.handler.RestAuthenticationEntryPoint;
import com.agri.market.security.jwt.JwtAuthenticationFilter;
import com.agri.market.security.oauth2.handler.OAuth2SuccessHandler;
import com.agri.market.security.properties.CorsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@EnableConfigurationProperties({
        PasswordSecurityProperties.class,
        LoginAttemptProperties.class,
        AuthenticationCookieProperties.class,
        CorsProperties.class
})
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            // Authentication
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh-token",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/auth/verify-email",
            "/api/v1/auth/resend-verification-email",

            // OAuth2
            "/api/v1/auth/oauth2/exchange",

            // OpenAPI / Swagger
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",

            // Public General Catalog & Advisory Services
            "/api/v1/categories/**",
            "/api/v1/weather/**",
            "/api/v1/market-prices/**",
            "/api/v1/crops/**"
    };

    private static final String[] ADMIN_ENDPOINTS = {
            "/api/v1/admin/**"
    };

    private static final String[] USER_ENDPOINTS = {
            "/api/v1/users/**"
    };
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(
            final HttpSecurity http) throws Exception {

        http
                .cors(cors -> {
                })
                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS)
                        .permitAll()

                        // Private User Product endpoints must be authenticated before general product matchers
                        .requestMatchers("/api/v1/products/me")
                        .authenticated()

                        // Public Product browsing and search (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/search", "/api/v1/products/*", "/api/v1/products/*/images")
                        .permitAll()

                        .requestMatchers(ADMIN_ENDPOINTS)
                        .hasRole("ADMIN")

                        .requestMatchers(USER_ENDPOINTS)
                        .hasAnyRole("USER", "ADMIN")

                        .anyRequest()
                        .authenticated()
                )
                .exceptionHandling(exception -> exception
                        .defaultAuthenticationEntryPointFor(
                                restAuthenticationEntryPoint,
                                request -> request.getRequestURI()
                                        .startsWith("/api/")
                        )
                        .defaultAccessDeniedHandlerFor(
                                restAccessDeniedHandler,
                                request -> request.getRequestURI()
                                        .startsWith("/api/")
                        )
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                )


                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}