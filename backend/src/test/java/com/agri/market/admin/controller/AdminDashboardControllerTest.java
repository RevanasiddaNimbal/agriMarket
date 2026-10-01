package com.agri.market.admin.controller;

import com.agri.market.admin.dto.AdminDashboardResponseDto;
import com.agri.market.admin.service.AdminDashboardService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("AdminDashboardController")
class AdminDashboardControllerTest {

    private static final String BASE_URL = "/api/v1/admin/dashboard";

    @Mock
    private AdminDashboardService adminDashboardService;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminDashboardController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Test
    void shouldReturnAdminDashboard() throws Exception {
        final AdminDashboardResponseDto responseDto = AdminDashboardResponseDto.builder()
                .totalUsers(25L)
                .totalProducts(10L)
                .totalOrders(30L)
                .build();

        given(adminDashboardService.getDashboard()).willReturn(responseDto);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_users").value(25))
                .andExpect(jsonPath("$.total_products").value(10))
                .andExpect(jsonPath("$.total_orders").value(30));
    }
}
