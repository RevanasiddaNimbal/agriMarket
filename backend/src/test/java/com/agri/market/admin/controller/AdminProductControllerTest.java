package com.agri.market.admin.controller;

import com.agri.market.admin.dto.AdminProductStatusUpdateRequestDto;
import com.agri.market.admin.service.AdminProductService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.dto.ProductSearchRequestDto;
import com.agri.market.product.dto.ProductSearchResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminProductController")
class AdminProductControllerTest {

    private static final String BASE_URL = "/api/v1/admin/products";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AdminProductService adminProductService;

    @InjectMocks
    private AdminProductController adminProductController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminProductController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getProducts")
    class GetProductsTests {

        @Test
        void shouldSearchProductsSuccessfully() throws Exception {
            final ProductSearchResponseDto response = ProductSearchResponseDto.builder()
                    .totalElements(10L)
                    .build();

            given(adminProductService.searchProducts(any(ProductSearchRequestDto.class))).willReturn(response);

            mockMvc.perform(get(BASE_URL).param("query", "Seeds"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(10));
        }
    }

    @Nested
    @DisplayName("getProductById")
    class GetProductByIdTests {

        @Test
        void shouldReturnProductById() throws Exception {
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("p1")
                    .name("Wheat")
                    .build();

            given(adminProductService.getProductById("p1")).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/{productId}", "p1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("p1"))
                    .andExpect(jsonPath("$.name").value("Wheat"));
        }
    }

    @Nested
    @DisplayName("updateProductStatus")
    class UpdateStatusTests {

        @Test
        void shouldUpdateProductStatus() throws Exception {
            final AdminProductStatusUpdateRequestDto request = new AdminProductStatusUpdateRequestDto();
            request.setStatus("INACTIVE");

            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("p1")
                    .status("INACTIVE")
                    .build();

            given(adminProductService.updateProductStatus(eq("p1"), eq("INACTIVE"))).willReturn(response);

            mockMvc.perform(patch(BASE_URL + "/{productId}/status", "p1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("INACTIVE"));
        }
    }
}
