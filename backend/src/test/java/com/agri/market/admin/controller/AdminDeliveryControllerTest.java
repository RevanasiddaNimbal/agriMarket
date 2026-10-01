package com.agri.market.admin.controller;

import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.service.AdminDeliveryService;
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

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminDeliveryController")
class AdminDeliveryControllerTest {

    private static final String BASE_URL = "/api/v1/admin/deliveries";

    @Mock
    private AdminDeliveryService adminDeliveryService;

    @InjectMocks
    private AdminDeliveryController adminDeliveryController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminDeliveryController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAllDeliveries")
    class GetAllDeliveriesTests {

        @Test
        void shouldReturnAllDeliveries() throws Exception {
            final DeliveryResponseDto response = DeliveryResponseDto.builder()
                    .id("del-1")
                    .build();

            given(adminDeliveryService.getAllDeliveries()).willReturn(List.of(response));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("del-1"));
        }
    }

    @Nested
    @DisplayName("status updates")
    class StatusUpdateTests {

        @Test
        void shouldMarkAsShipped() throws Exception {
            final DeliveryResponseDto response = DeliveryResponseDto.builder()
                    .id("del-1")
                    .build();

            given(adminDeliveryService.markAsShipped("del-1")).willReturn(response);

            mockMvc.perform(put(BASE_URL + "/{deliveryId}/ship", "del-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("del-1"));
        }

        @Test
        void shouldMarkAsOutForDelivery() throws Exception {
            final DeliveryResponseDto response = DeliveryResponseDto.builder()
                    .id("del-1")
                    .build();

            given(adminDeliveryService.markAsOutForDelivery("del-1")).willReturn(response);

            mockMvc.perform(put(BASE_URL + "/{deliveryId}/out-for-delivery", "del-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("del-1"));
        }
    }
}
