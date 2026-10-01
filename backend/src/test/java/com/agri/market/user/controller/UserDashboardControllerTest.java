package com.agri.market.user.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.dto.UserDashboardBuyingDto;
import com.agri.market.user.dto.UserDashboardResponseDto;
import com.agri.market.user.dto.UserDashboardSellingDto;
import com.agri.market.user.entity.User;
import com.agri.market.user.service.UserDashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserDashboardController")
class UserDashboardControllerTest {

    private static final String BASE_URL = "/api/v1/user/dashboard";

    @Mock
    private UserDashboardService userDashboardService;

    @InjectMocks
    private UserDashboardController userDashboardController;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = UserTestFactory.activeUser();

        final HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders
                .standaloneSetup(userDashboardController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Test
    void shouldReturnUserDashboard() throws Exception {
        final UserDashboardBuyingDto buying = UserDashboardBuyingDto.builder().totalOrders(5L).build();
        final UserDashboardSellingDto selling = UserDashboardSellingDto.builder().totalProducts(3L).build();
        final UserDashboardResponseDto responseDto = UserDashboardResponseDto.builder()
                .buying(buying)
                .selling(selling)
                .totalAddresses(1L)
                .build();

        given(userDashboardService.getDashboard(testUser.getId())).willReturn(responseDto);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.buying.total_orders").value(5))
                .andExpect(jsonPath("$.selling.total_products").value(3))
                .andExpect(jsonPath("$.total_addresses").value(1));
    }
}
