package com.agri.market.inventory.mapper;

import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("InventoryMapper")
class InventoryMapperTest {

    private InventoryMapper inventoryMapper;

    @BeforeEach
    void setUp() {
        inventoryMapper = new InventoryMapper();
    }

    @Test
    void shouldMapInventoryToResponseDtoCorrectly() {
        final Product product = Product.builder()
                .id("prod-1")
                .unit("KG")
                .status(ProductStatus.ACTIVE.name())
                .build();

        final Inventory inventory = Inventory.builder()
                .id("inv-1")
                .product(product)
                .totalQuantity(new BigDecimal("100.00"))
                .reservedQuantity(new BigDecimal("20.00"))
                .build();

        final InventoryResponseDto dto = inventoryMapper.toResponseDto(inventory);

        assertThat(dto).isNotNull();
        assertThat(dto.getProductId()).isEqualTo("prod-1");
        assertThat(dto.getAvailableQuantity()).isEqualByComparingTo("80.00");
        assertThat(dto.getReservedQuantity()).isEqualByComparingTo("20.00");
        assertThat(dto.getUnit()).isEqualTo("KG");
        assertThat(dto.isAvailable()).isTrue();
    }

    @Test
    void shouldHandleNullQuantitiesAndNonActiveProduct() {
        final Product product = Product.builder()
                .id("prod-2")
                .unit("BAG")
                .status(ProductStatus.INACTIVE.name())
                .build();

        final Inventory inventory = Inventory.builder()
                .id("inv-2")
                .product(product)
                .totalQuantity(null)
                .reservedQuantity(null)
                .build();

        final InventoryResponseDto dto = inventoryMapper.toResponseDto(inventory);

        assertThat(dto).isNotNull();
        assertThat(dto.getProductId()).isEqualTo("prod-2");
        assertThat(dto.getAvailableQuantity()).isEqualByComparingTo("0");
        assertThat(dto.getReservedQuantity()).isEqualByComparingTo("0");
        assertThat(dto.isAvailable()).isFalse();
    }
}
