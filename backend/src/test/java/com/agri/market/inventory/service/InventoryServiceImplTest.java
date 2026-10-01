package com.agri.market.inventory.service;

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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryServiceImpl")
class InventoryServiceImplTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @Nested
    @DisplayName("getAvailability and getInventory")
    class GetInventoryTests {

        @Test
        void shouldReturnInventorySuccessfully() {
            final String productId = "prod-1";
            final Inventory inventory = Inventory.builder().id("inv-1").build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().productId(productId).build();

            given(inventoryRepository.findByProductId(productId)).willReturn(Optional.of(inventory));
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = inventoryService.getAvailability(productId);

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldThrowExceptionWhenInventoryNotFound() {
            given(inventoryRepository.findByProductId("unknown")).willReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.getInventory("unknown"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getMyInventory")
    class GetMyInventoryTests {

        @Test
        void shouldReturnFarmerInventoryList() {
            final String farmerId = "farmer-1";
            final Inventory inventory = Inventory.builder().id("inv-1").build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            given(inventoryRepository.findAllByFarmerId(farmerId)).willReturn(List.of(inventory));
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final List<InventoryResponseDto> result = inventoryService.getMyInventory(farmerId);

            assertThat(result).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("updateInventory")
    class UpdateInventoryTests {

        @Test
        void shouldUpdateInventoryQuantitySuccessfully() {
            final String productId = "p1";
            final String farmerId = "f1";
            final User farmer = User.builder().id(farmerId).build();
            final Product product = Product.builder().id(productId).farmer(farmer).build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("10")).build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().productId(productId).build();

            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("100"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = inventoryService.updateInventory(productId, farmerId, request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("100");
            then(inventoryRepository).should().save(inventory);
        }

        @Test
        void shouldThrowExceptionWhenRequestedQuantityIsLessThanReserved() {
            final String productId = "p1";
            final String farmerId = "f1";
            final User farmer = User.builder().id(farmerId).build();
            final Product product = Product.builder().id(productId).farmer(farmer).build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("30")).build();

            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("20"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> inventoryService.updateInventory(productId, farmerId, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_QUANTITY_LESS_THAN_RESERVED);
        }

        @Test
        void shouldThrowExceptionWhenFarmerDoesNotOwnProduct() {
            final String productId = "p1";
            final User actualOwner = User.builder().id("other-farmer").build();
            final Product product = Product.builder().id(productId).farmer(actualOwner).build();
            final Inventory inventory = Inventory.builder().product(product).build();

            final InventoryUpdateRequestDto request = new InventoryUpdateRequestDto();
            request.setQuantity(new BigDecimal("100"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> inventoryService.updateInventory(productId, "wrong-farmer", request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("addStock and removeStock")
    class StockAdjustmentTests {

        @Test
        void shouldAddStockSuccessfully() {
            final String productId = "p1";
            final String farmerId = "f1";
            final User farmer = User.builder().id(farmerId).build();
            final Product product = Product.builder().id(productId).farmer(farmer).build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("25"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = inventoryService.addStock(productId, farmerId, request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("75");
            then(inventoryRepository).should().save(inventory);
        }

        @Test
        void shouldRemoveStockSuccessfully() {
            final String productId = "p1";
            final String farmerId = "f1";
            final User farmer = User.builder().id(farmerId).build();
            final Product product = Product.builder().id(productId).farmer(farmer).build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("10")).build();
            final InventoryResponseDto dto = InventoryResponseDto.builder().build();

            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("20"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory)).willReturn(inventory);
            given(inventoryMapper.toResponseDto(inventory)).willReturn(dto);

            final InventoryResponseDto result = inventoryService.removeStock(productId, farmerId, request);

            assertThat(result).isSameAs(dto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("30");
            then(inventoryRepository).should().save(inventory);
        }

        @Test
        void shouldThrowExceptionWhenRemovingStockLeavesQuantityBelowReserved() {
            final String productId = "p1";
            final String farmerId = "f1";
            final User farmer = User.builder().id(farmerId).build();
            final Product product = Product.builder().id(productId).farmer(farmer).build();
            final Inventory inventory = Inventory.builder().id("inv-1").product(product).totalQuantity(new BigDecimal("50")).reservedQuantity(new BigDecimal("40")).build();

            final StockAdjustmentRequestDto request = new StockAdjustmentRequestDto();
            request.setQuantity(new BigDecimal("20"));

            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> inventoryService.removeStock(productId, farmerId, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_QUANTITY_LESS_THAN_RESERVED);
        }
    }
}
