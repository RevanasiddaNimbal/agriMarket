package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.dto.InventoryUpdateRequestDto;
import com.agri.market.inventory.dto.StockAdjustmentRequestDto;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.mapper.InventoryMapper;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.entity.Product;
import com.agri.market.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminInventoryServiceImpl")
class AdminInventoryServiceImplTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @InjectMocks
    private AdminInventoryServiceImpl adminInventoryService;

    @Nested
    @DisplayName("getInventory")
    class GetInventoryTests {

        @Test
        void shouldReturnInventorySuccessfully() {
            final Inventory inventory = Inventory.builder().id("inv-1").build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            given(inventoryRepository.findByProductId("p1")).willReturn(Optional.of(inventory));
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = adminInventoryService.getInventory("p1");

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenInventoryNotFound() {
            given(inventoryRepository.findByProductId("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> adminInventoryService.getInventory("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("updateInventory")
    class UpdateInventoryTests {

        @Test
        void shouldUpdateInventorySuccessfully() {
            final Product product = Product.builder().id("p1").build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("10")).build();
            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("100"));

            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            given(inventoryRepository.findByProductIdForUpdate("p1")).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = adminInventoryService.updateInventory("p1", request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("100");
            then(inventoryRepository).should().save(inventory);
        }
    }

    @Nested
    @DisplayName("addStock and removeStock")
    class StockAdjustmentTests {

        @Test
        void shouldAddStockSuccessfully() {
            final Product product = Product.builder().id("p1").build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).build();
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("20"));

            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            given(inventoryRepository.findByProductIdForUpdate("p1")).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = adminInventoryService.addStock("p1", request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("70");
            then(inventoryRepository).should().save(inventory);
        }

        @Test
        void shouldRemoveStockSuccessfully() {
            final Product product = Product.builder().id("p1").build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("10")).build();
            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("20"));

            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            given(inventoryRepository.findByProductIdForUpdate("p1")).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = adminInventoryService.removeStock("p1", request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("30");
            then(inventoryRepository).should().save(inventory);
        }
    }
}
