package com.agri.market.product.controller;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.service.ProductService;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductController")
class ProductControllerTest {

    private static final String BASE_URL = "/api/v1/products";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

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
                .standaloneSetup(productController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private ProductRequestDto createValidRequest() {
        return ProductRequestDto.builder()
                .categoryId("cat-1")
                .name("Tomato Seeds")
                .description("Quality seeds for growing fresh tomatoes")
                .price(new BigDecimal("120.00"))
                .unit("KG")
                .quantity(new BigDecimal("20.00"))
                .location("Bangalore")
                .build();
    }

    @Nested
    @DisplayName("createProduct")
    class CreateProductTests {

        @Test
        void shouldCreateProductSuccessfully() throws Exception {
            final ProductRequestDto request = createValidRequest();
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("prod-1")
                    .name(request.getName())
                    .price(request.getPrice())
                    .build();

            given(productService.createProduct(any(ProductRequestDto.class), eq(testUser.getId())))
                    .willReturn(response);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("prod-1"))
                    .andExpect(jsonPath("$.name").value("Tomato Seeds"));
        }

        @Test
        void shouldReturnBadRequestWhenFieldsAreInvalid() throws Exception {
            final ProductRequestDto request = ProductRequestDto.builder()
                    .categoryId("")
                    .name("")
                    .build();

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("getAllProducts")
    class GetAllProductsTests {

        @Test
        void shouldReturnAllProducts() throws Exception {
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("prod-1")
                    .name("Wheat")
                    .build();

            given(productService.getAllProducts()).willReturn(List.of(response));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("prod-1"))
                    .andExpect(jsonPath("$[0].name").value("Wheat"));
        }
    }

    @Nested
    @DisplayName("getProductById")
    class GetProductByIdTests {

        @Test
        void shouldReturnProductWhenFound() throws Exception {
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("prod-1")
                    .name("Wheat")
                    .build();

            given(productService.getProductById("prod-1")).willReturn(response);

            mockMvc.perform(get(BASE_URL + "/{id}", "prod-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("prod-1"));
        }

        @Test
        void shouldReturnNotFoundWhenProductDoesNotExist() throws Exception {
            given(productService.getProductById("prod-999"))
                    .willThrow(new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            mockMvc.perform(get(BASE_URL + "/{id}", "prod-999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value(ErrorCode.PRODUCT_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("getMyProducts")
    class GetMyProductsTests {

        @Test
        void shouldReturnUserProducts() throws Exception {
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("prod-1")
                    .build();

            given(productService.getMyProducts(testUser.getId())).willReturn(List.of(response));

            mockMvc.perform(get(BASE_URL + "/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("prod-1"));
        }
    }

    @Nested
    @DisplayName("updateProduct")
    class UpdateProductTests {

        @Test
        void shouldUpdateProductSuccessfully() throws Exception {
            final ProductRequestDto request = createValidRequest();
            final ProductResponseDto response = ProductResponseDto.builder()
                    .id("prod-1")
                    .name("Updated Tomato Seeds")
                    .build();

            given(productService.updateProduct(eq("prod-1"), any(ProductRequestDto.class), eq(testUser.getId())))
                    .willReturn(response);

            mockMvc.perform(patch(BASE_URL + "/{id}", "prod-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("prod-1"))
                    .andExpect(jsonPath("$.name").value("Updated Tomato Seeds"));
        }
    }

    @Nested
    @DisplayName("deleteProduct")
    class DeleteProductTests {

        @Test
        void shouldDeleteProductSuccessfully() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", "prod-1"))
                    .andExpect(status().isNoContent());

            then(productService).should().deleteProduct("prod-1", testUser.getId());
        }
    }
}
