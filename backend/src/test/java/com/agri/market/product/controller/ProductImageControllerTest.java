package com.agri.market.product.controller;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.product.dto.ProductImageRequestDto;
import com.agri.market.product.dto.ProductImageResponseDto;
import com.agri.market.product.service.ProductImageService;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductImageController")
class ProductImageControllerTest {

    private static final String BASE_URL = "/api/v1/products";

    @Mock
    private ProductImageService productImageService;

    @InjectMocks
    private ProductImageController productImageController;

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
                .standaloneSetup(productImageController)
                .setCustomArgumentResolvers(authPrincipalResolver)
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
                    .imageUrl("http://img.jpg")
                    .build();

            given(productImageService.uploadImage(eq("p1"), any(ProductImageRequestDto.class), eq(testUser)))
                    .willReturn(response);

            mockMvc.perform(multipart(BASE_URL + "/{productId}/images", "p1")
                            .file(file)
                            .param("primary", "true")
                            .param("displayOrder", "1"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("img-1"))
                    .andExpect(jsonPath("$.productId").value("p1"));
        }
    }

    @Nested
    @DisplayName("getProductImages")
    class GetProductImagesTests {

        @Test
        void shouldReturnProductImages() throws Exception {
            final ProductImageResponseDto response = ProductImageResponseDto.builder()
                    .id("img-1")
                    .productId("p1")
                    .build();

            given(productImageService.getProductImages("p1")).willReturn(List.of(response));

            mockMvc.perform(get(BASE_URL + "/{productId}/images", "p1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("img-1"));
        }
    }

    @Nested
    @DisplayName("deleteProductImage")
    class DeleteProductImageTests {

        @Test
        void shouldDeleteProductImage() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{productId}/images/{imageId}", "p1", "img-1"))
                    .andExpect(status().isNoContent());

            then(productImageService).should().deleteImage("p1", "img-1", testUser);
        }
    }
}
