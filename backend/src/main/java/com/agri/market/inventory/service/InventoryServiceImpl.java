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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponseDto getAvailability(String productId) {

        log.info(
                "Fetching inventory availability for product: {}",
                productId
        );

        Inventory inventory = findInventory(productId);

        return inventoryMapper.toResponseDto(inventory);
    }

    @Override
    public InventoryResponseDto getInventory(String productId) {

        log.info(
                "Fetching inventory for product: {}",
                productId
        );

        Inventory inventory = findInventory(productId);

        return inventoryMapper.toResponseDto(inventory);
    }

    @Override
    public List<InventoryResponseDto> getMyInventory(String farmerId) {

        log.info(
                "Fetching inventory for farmer: {}",
                farmerId
        );

        return inventoryRepository.findAllByFarmerId(farmerId)
                .stream()
                .map(inventoryMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public InventoryResponseDto updateInventory(
            String productId,
            String farmerId,
            InventoryUpdateRequestDto request
    ) {

        log.info(
                "Updating inventory quantity for product: {} by farmer: {}",
                productId,
                farmerId
        );

        Inventory inventory =
                findInventoryForUpdate(productId);

        Product product = inventory.getProduct();

        validateProductOwnership(product, farmerId);

        BigDecimal reservedQuantity =
                inventory.getReservedQuantity();

        if (request.getQuantity().compareTo(reservedQuantity) < 0) {
            log.warn(
                    "Inventory update rejected for product: {} because quantity {} is less than reserved quantity {}",
                    productId,
                    request.getQuantity(),
                    reservedQuantity
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_QUANTITY_LESS_THAN_RESERVED
            );
        }

        inventory.setTotalQuantity(request.getQuantity());

        final Inventory updatedInventory =
                inventoryRepository.save(inventory);

        log.info(
                "Inventory quantity updated successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponseDto addStock(
            String productId,
            String farmerId,
            StockAdjustmentRequestDto request
    ) {

        log.info(
                "Adding stock for product: {} by farmer: {}",
                productId,
                farmerId
        );

        Inventory inventory =
                findInventoryForUpdate(productId);

        Product product = inventory.getProduct();

        validateProductOwnership(product, farmerId);

        BigDecimal currentQuantity = inventory.getTotalQuantity();

        if (currentQuantity == null) {
            currentQuantity = BigDecimal.ZERO;
        }

        inventory.setTotalQuantity(
                currentQuantity.add(request.getQuantity())
        );

        final Inventory updatedInventory =
                inventoryRepository.save(inventory);

        log.info(
                "Stock added successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponseDto removeStock(
            String productId,
            String farmerId,
            StockAdjustmentRequestDto request
    ) {

        log.info(
                "Removing stock for product: {} by farmer: {}",
                productId,
                farmerId
        );

        Inventory inventory =
                findInventoryForUpdate(productId);

        Product product = inventory.getProduct();

        validateProductOwnership(product, farmerId);

        BigDecimal currentQuantity = inventory.getTotalQuantity();

        if (currentQuantity == null) {
            currentQuantity = BigDecimal.ZERO;
        }

        BigDecimal newQuantity =
                currentQuantity.subtract(request.getQuantity());

        if (newQuantity.compareTo(
                inventory.getReservedQuantity()
        ) < 0) {

            log.warn(
                    "Stock removal rejected for product: {} because resulting quantity {} is less than reserved quantity {}",
                    productId,
                    newQuantity,
                    inventory.getReservedQuantity()
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_QUANTITY_LESS_THAN_RESERVED
            );
        }

        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {

            log.warn(
                    "Stock removal rejected for product: {} because resulting quantity is negative",
                    productId
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_INSUFFICIENT_STOCK
            );
        }

        inventory.setTotalQuantity(newQuantity);

        final Inventory updatedInventory =
                inventoryRepository.save(inventory);

        log.info(
                "Stock removed successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    private Inventory findInventory(String productId) {

        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> {
                    log.warn(
                            "Inventory not found for product: {}",
                            productId
                    );

                    return new BusinessException(
                            ErrorCode.INVENTORY_NOT_FOUND
                    );
                });
    }

    private Inventory findInventoryForUpdate(String productId) {

        return inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> {
                    log.warn(
                            "Inventory not found for product: {}",
                            productId
                    );

                    return new BusinessException(
                            ErrorCode.INVENTORY_NOT_FOUND
                    );
                });
    }

    private void validateProductOwnership(
            Product product,
            String farmerId
    ) {

        if (product.getFarmer() == null
                || !product.getFarmer().getId().equals(farmerId)) {

            log.warn(
                    "Farmer {} attempted to modify inventory of product: {} without ownership",
                    farmerId,
                    product.getId()
            );

            throw new BusinessException(
                    ErrorCode.PRODUCT_ACCESS_DENIED
            );
        }
    }
}