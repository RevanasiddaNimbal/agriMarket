package com.agri.market.admin.controller;

import com.agri.market.admin.service.AdminProductImageService;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.product.dto.ProductImageRequestDto;
import com.agri.market.product.dto.ProductImageResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminProductImageController")
class AdminProductImageControllerTest {

    private static final String BASE_URL = "/api/v1/admin/products";

    @Mock
    private AdminProductImageService adminProductImageService;

    @InjectMocks
    private AdminProductImageController adminProductImageController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(adminProductImageController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("uploadImage")
    class UploadImageTests {

        @Test
        void shouldUploadImageSuccessfully() throws Exception {
            final MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageResponseDto response = ProductImageResponseDto.builder()
                    .id("img-1")
                    .productId("p1")
                    .build();

            given(adminProductImageService.uploadImage(eq("p1"), any(ProductImageRequestDto.class)))
                    .willReturn(response);

            mockMvc.perform(multipart(BASE_URL + "/{productId}/images", "p1")
                            .file(file)
                            .param("primary", "false")
                            .param("displayOrder", "1"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("img-1"));
        }
    }

    @Nested
    @DisplayName("getProductImages")
    class GetProductImagesTests {

        @Test
        void shouldReturnProductImages() throws Exception {
            final ProductImageResponseDto response = ProductImageResponseDto.builder()
                    .id("img-1")
                    .build();

            given(adminProductImageService.getProductImages("p1")).willReturn(List.of(response));

            mockMvc.perform(get(BASE_URL + "/{productId}/images", "p1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("img-1"));
        }
    }

    @Nested
    @DisplayName("deleteImage")
    class DeleteImageTests {

        @Test
        void shouldDeleteImageSuccessfully() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{productId}/images/{imageId}", "p1", "img-1"))
                    .andExpect(status().isNoContent());

            then(adminProductImageService).should().deleteImage("p1", "img-1");
        }
    }
}
