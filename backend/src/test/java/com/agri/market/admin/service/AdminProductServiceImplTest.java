package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.dto.ProductSearchRequestDto;
import com.agri.market.product.dto.ProductSearchResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.product.service.ProductSearchService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminProductServiceImpl")
class AdminProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private ProductSearchService productSearchService;

    @InjectMocks
    private AdminProductServiceImpl adminProductService;

    @Nested
    @DisplayName("searchProducts and getProductById")
    class SearchAndGetTests {

        @Test
        void shouldSearchProductsSuccessfully() {
            final ProductSearchRequestDto request = ProductSearchRequestDto.builder().query("Wheat").build();
            final ProductSearchResponseDto response = ProductSearchResponseDto.builder().totalElements(1L).build();

            given(productSearchService.searchProducts(any(ProductSearchRequestDto.class), eq(false))).willReturn(response);

            final ProductSearchResponseDto result = adminProductService.searchProducts(request);

            assertThat(result).isSameAs(response);
            assertThat(result.getTotalElements()).isEqualTo(1L);
        }

        @Test
        void shouldGetProductById() {
            final Product product = Product.builder().id("p1").build();
            final ProductResponseDto dto = ProductResponseDto.builder().id("p1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productMapper.toResponseDto(product)).willReturn(dto);

            final ProductResponseDto result = adminProductService.getProductById("p1");

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenProductNotFound() {
            given(productRepository.findById("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> adminProductService.getProductById("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("updateProductStatus")
    class UpdateStatusTests {

        @Test
        void shouldUpdateStatusSuccessfully() {
            final Product product = Product.builder().id("p1").status(ProductStatus.ACTIVE.name()).build();
            final Product savedProduct = Product.builder().id("p1").status(ProductStatus.INACTIVE.name()).build();
            final ProductResponseDto dto = ProductResponseDto.builder().id("p1").status(ProductStatus.INACTIVE.name()).build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productRepository.save(product)).willReturn(savedProduct);
            given(productMapper.toResponseDto(savedProduct)).willReturn(dto);

            final ProductResponseDto result = adminProductService.updateProductStatus("p1", "INACTIVE");

            assertThat(result).isSameAs(dto);
            assertThat(product.getStatus()).isEqualTo(ProductStatus.INACTIVE.name());
        }

        @Test
        void shouldThrowExceptionWhenStatusIsInvalid() {
            final Product product = Product.builder().id("p1").build();
            given(productRepository.findById("p1")).willReturn(Optional.of(product));

            assertThatThrownBy(() -> adminProductService.updateProductStatus("p1", "NON_EXISTENT_STATUS"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVALID_PRODUCT_STATUS);
        }
    }
}
