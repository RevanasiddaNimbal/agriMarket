package com.agri.market.product.mapper;

import com.agri.market.category.entity.Category;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.dto.ProductImageResponseDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductImage;
import com.agri.market.product.repository.ProductImageRepository;
import com.agri.market.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductMapper")
class ProductMapperTest {

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ProductImageMapper productImageMapper;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private ProductMapper productMapper;

    @Nested
    @DisplayName("toResponseDto")
    class ToResponseDtoTests {

        @Test
        void shouldMapProductWithAllAssociationsSuccessfully() {
            final User farmer = User.builder()
                    .id("farmer-1")
                    .fullName("Farmer Ramesh")
                    .build();

            final Category category = Category.builder()
                    .id("cat-1")
                    .name("Seeds")
                    .build();

            final Product product = Product.builder()
                    .id("prod-1")
                    .farmer(farmer)
                    .category(category)
                    .name("Wheat")
                    .description("High yield wheat")
                    .price(new BigDecimal("100.00"))
                    .unit("KG")
                    .location("Karnataka")
                    .status("ACTIVE")
                    .build();

            final Inventory inventory = Inventory.builder()
                    .product(product)
                    .totalQuantity(new BigDecimal("50.00"))
                    .reservedQuantity(BigDecimal.ZERO)
                    .build();

            final ProductImage image = ProductImage.builder()
                    .id("img-1")
                    .product(product)
                    .imageUrl("http://example.com/img.jpg")
                    .primary(true)
                    .displayOrder(1)
                    .build();

            final ProductImageResponseDto imageDto = ProductImageResponseDto.builder()
                    .id("img-1")
                    .productId("prod-1")
                    .imageUrl("http://example.com/img.jpg")
                    .primary(true)
                    .displayOrder(1)
                    .build();

            given(productImageRepository.findAllByProduct_IdOrderByDisplayOrderAsc("prod-1"))
                    .willReturn(List.of(image));
            given(productImageMapper.toResponseDto(image)).willReturn(imageDto);
            given(inventoryRepository.findByProductId("prod-1")).willReturn(Optional.of(inventory));

            final ProductResponseDto dto = productMapper.toResponseDto(product);

            assertThat(dto).isNotNull();
            assertThat(dto.getId()).isEqualTo("prod-1");
            assertThat(dto.getFarmerId()).isEqualTo("farmer-1");
            assertThat(dto.getFarmerName()).isEqualTo("Farmer Ramesh");
            assertThat(dto.getCategoryId()).isEqualTo("cat-1");
            assertThat(dto.getCategoryName()).isEqualTo("Seeds");
            assertThat(dto.getName()).isEqualTo("Wheat");
            assertThat(dto.getPrice()).isEqualByComparingTo("100.00");
            assertThat(dto.getQuantity()).isEqualByComparingTo("50.00");
            assertThat(dto.getImages()).containsExactly(imageDto);
        }

        @Test
        void shouldCalculateAvailableQuantityWhenReservedIsNonZero() {
            final Product product = Product.builder()
                    .id("prod-1")
                    .build();

            final Inventory inventory = Inventory.builder()
                    .product(product)
                    .totalQuantity(new BigDecimal("65.00"))
                    .reservedQuantity(new BigDecimal("10.00"))
                    .build();

            given(productImageRepository.findAllByProduct_IdOrderByDisplayOrderAsc("prod-1"))
                    .willReturn(List.of());
            given(inventoryRepository.findByProductId("prod-1")).willReturn(Optional.of(inventory));

            final ProductResponseDto dto = productMapper.toResponseDto(product);

            assertThat(dto.getQuantity()).isEqualByComparingTo("55.00");
        }

        @Test
        void shouldHandleNullFarmerAndCategory() {
            final Product product = Product.builder()
                    .id("prod-2")
                    .farmer(null)
                    .category(null)
                    .name("Barley")
                    .build();

            given(productImageRepository.findAllByProduct_IdOrderByDisplayOrderAsc("prod-2"))
                    .willReturn(List.of());
            given(inventoryRepository.findByProductId("prod-2")).willReturn(Optional.empty());

            final ProductResponseDto dto = productMapper.toResponseDto(product);

            assertThat(dto).isNotNull();
            assertThat(dto.getFarmerId()).isNull();
            assertThat(dto.getFarmerName()).isNull();
            assertThat(dto.getCategoryId()).isNull();
            assertThat(dto.getCategoryName()).isNull();
            assertThat(dto.getImages()).isEmpty();
        }
    }
}
