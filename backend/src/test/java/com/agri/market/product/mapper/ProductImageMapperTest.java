package com.agri.market.product.mapper;

import com.agri.market.product.dto.ProductImageResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductImage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ProductImageMapper")
class ProductImageMapperTest {

    private ProductImageMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ProductImageMapper();
    }

    @Test
    void shouldReturnNullWhenProductImageIsNull() {
        assertThat(mapper.toResponseDto(null)).isNull();
    }

    @Test
    void shouldMapProductImageToResponseDto() {
        final Product product = Product.builder()
                .id("prod-1")
                .build();

        final ProductImage productImage = ProductImage.builder()
                .id("img-1")
                .product(product)
                .imageUrl("https://cloud.com/image.jpg")
                .primary(true)
                .displayOrder(1)
                .build();

        final ProductImageResponseDto dto = mapper.toResponseDto(productImage);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("img-1");
        assertThat(dto.getProductId()).isEqualTo("prod-1");
        assertThat(dto.getImageUrl()).isEqualTo("https://cloud.com/image.jpg");
        assertThat(dto.isPrimary()).isTrue();
        assertThat(dto.getDisplayOrder()).isEqualTo(1);
    }

    @Test
    void shouldMapProductImageWhenProductIsNull() {
        final ProductImage productImage = ProductImage.builder()
                .id("img-2")
                .product(null)
                .imageUrl("https://cloud.com/img2.jpg")
                .primary(false)
                .displayOrder(2)
                .build();

        final ProductImageResponseDto dto = mapper.toResponseDto(productImage);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("img-2");
        assertThat(dto.getProductId()).isNull();
        assertThat(dto.isPrimary()).isFalse();
    }
}
