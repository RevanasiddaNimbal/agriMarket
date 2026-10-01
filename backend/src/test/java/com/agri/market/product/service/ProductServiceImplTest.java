package com.agri.market.product.service;

import com.agri.market.category.entity.Category;
import com.agri.market.category.repository.CategoryRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductServiceImpl")
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private ProductRequestDto createSampleRequest() {
        return ProductRequestDto.builder()
                .categoryId("cat-1")
                .name("Organic Fertilizer")
                .description("Quality fertilizer for crops")
                .price(new BigDecimal("250.00"))
                .unit("KG")
                .quantity(new BigDecimal("100.00"))
                .location("Hubli")
                .build();
    }

    @Nested
    @DisplayName("createProduct")
    class CreateProductTests {

        @Test
        void shouldCreateProductAndInventorySuccessfully() {
            final String userId = "user-1";
            final ProductRequestDto request = createSampleRequest();

            final User user = User.builder().id(userId).email("user@mail.com").build();
            final Category category = Category.builder().id("cat-1").name("Fertilizers").build();
            final Product savedProduct = Product.builder().id("prod-100").farmer(user).category(category).build();
            final ProductResponseDto responseDto = ProductResponseDto.builder().id("prod-100").build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(categoryRepository.findById("cat-1")).willReturn(Optional.of(category));
            given(productRepository.save(any(Product.class))).willReturn(savedProduct);
            given(productMapper.toResponseDto(savedProduct)).willReturn(responseDto);

            final ProductResponseDto result = productService.createProduct(request, userId);

            assertThat(result).isSameAs(responseDto);

            final ArgumentCaptor<Inventory> inventoryCaptor = ArgumentCaptor.forClass(Inventory.class);
            then(inventoryRepository).should().save(inventoryCaptor.capture());
            final Inventory savedInventory = inventoryCaptor.getValue();
            assertThat(savedInventory.getProduct()).isEqualTo(savedProduct);
            assertThat(savedInventory.getReservedQuantity()).isEqualTo(BigDecimal.ZERO);
        }

        @Test
        void shouldThrowExceptionWhenUserNotFound() {
            final ProductRequestDto request = createSampleRequest();
            given(userRepository.findById("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productService.createProduct(request, "unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }

        @Test
        void shouldThrowExceptionWhenCategoryNotFound() {
            final String userId = "user-1";
            final ProductRequestDto request = createSampleRequest();
            final User user = User.builder().id(userId).build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(categoryRepository.findById(request.getCategoryId())).willReturn(Optional.empty());

            assertThatThrownBy(() -> productService.createProduct(request, userId))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.CATEGORY_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getAllProducts")
    class GetAllProductsTests {

        @Test
        void shouldReturnAllActiveProducts() {
            final Product product = Product.builder().id("p1").build();
            final ProductResponseDto dto = ProductResponseDto.builder().id("p1").build();

            given(productRepository.findAll(any(Specification.class))).willReturn(List.of(product));
            given(productMapper.toResponseDto(product)).willReturn(dto);

            final List<ProductResponseDto> result = productService.getAllProducts();

            assertThat(result).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("getProductById")
    class GetProductByIdTests {

        @Test
        void shouldReturnProductWhenFound() {
            final Product product = Product.builder().id("p1").build();
            final ProductResponseDto dto = ProductResponseDto.builder().id("p1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productMapper.toResponseDto(product)).willReturn(dto);

            final ProductResponseDto result = productService.getProductById("p1");

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenProductNotFound() {
            given(productRepository.findById("p1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productService.getProductById("p1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getMyProducts")
    class GetMyProductsTests {

        @Test
        void shouldReturnMyProducts() {
            final Product product = Product.builder().id("p1").build();
            final ProductResponseDto dto = ProductResponseDto.builder().id("p1").build();

            given(productRepository.findAll(any(Specification.class))).willReturn(List.of(product));
            given(productMapper.toResponseDto(product)).willReturn(dto);

            final List<ProductResponseDto> result = productService.getMyProducts("u1");

            assertThat(result).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("updateProduct")
    class UpdateProductTests {

        @Test
        void shouldUpdateProductSuccessfully() {
            final String userId = "u1";
            final String prodId = "p1";
            final ProductRequestDto request = createSampleRequest();

            final Category category = Category.builder().id("cat-1").name("Fertilizers").build();
            final Product existingProduct = Product.builder().id(prodId).build();
            final Product updatedProduct = Product.builder().id(prodId).name("Organic Fertilizer").build();
            final ProductResponseDto dto = ProductResponseDto.builder().id(prodId).name("Organic Fertilizer").build();

            given(productRepository.findByIdAndFarmer_Id(prodId, userId)).willReturn(Optional.of(existingProduct));
            given(categoryRepository.findById("cat-1")).willReturn(Optional.of(category));
            given(productRepository.save(existingProduct)).willReturn(updatedProduct);
            given(productMapper.toResponseDto(updatedProduct)).willReturn(dto);

            final ProductResponseDto result = productService.updateProduct(prodId, request, userId);

            assertThat(result).isSameAs(dto);
            assertThat(existingProduct.getName()).isEqualTo("Organic Fertilizer");
            assertThat(existingProduct.getCategory()).isEqualTo(category);
        }

        @Test
        void shouldThrowExceptionWhenProductNotFoundOrNotOwnedByUser() {
            final ProductRequestDto request = createSampleRequest();
            given(productRepository.findByIdAndFarmer_Id("p1", "u1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productService.updateProduct("p1", request, "u1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("deleteProduct")
    class DeleteProductTests {

        @Test
        void shouldDeleteProductSuccessfully() {
            final String prodId = "p1";
            final String userId = "u1";
            final Product existingProduct = Product.builder().id(prodId).build();

            given(productRepository.findByIdAndFarmer_Id(prodId, userId)).willReturn(Optional.of(existingProduct));

            productService.deleteProduct(prodId, userId);

            then(productRepository).should().delete(existingProduct);
        }

        @Test
        void shouldThrowExceptionWhenDeletingNonExistentOrUnownedProduct() {
            given(productRepository.findByIdAndFarmer_Id("p1", "u1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productService.deleteProduct("p1", "u1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }
}
