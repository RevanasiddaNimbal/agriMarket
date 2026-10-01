package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.dto.InventoryUpdateRequestDto;
import com.agri.market.inventory.dto.StockAdjustmentRequestDto;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.mapper.InventoryMapper;
import com.agri.market.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminInventoryServiceImpl implements AdminInventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponseDto getInventory(
            final String productId
    ) {

        log.info(
                "Admin inventory retrieval requested for product: {}",
                productId
        );

        final Inventory inventory =
                findInventory(productId);

        return inventoryMapper.toResponseDto(inventory);
    }

    @Override
    @Transactional
    public InventoryResponseDto updateInventory(
            final String productId,
            final InventoryUpdateRequestDto request
    ) {

        log.info(
                "Admin inventory update requested for product: {}",
                productId
        );

        final Inventory inventory =
                findInventoryForUpdate(productId);

        final BigDecimal reservedQuantity =
                inventory.getReservedQuantity();

        if (request.getQuantity().compareTo(reservedQuantity) < 0) {

            log.warn(
                    "Admin inventory update rejected for product: {} because quantity {} is less than reserved quantity {}",
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
                "Admin inventory updated successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponseDto addStock(
            final String productId,
            final StockAdjustmentRequestDto request
    ) {

        log.info(
                "Admin stock addition requested for product: {}",
                productId
        );

        final Inventory inventory =
                findInventoryForUpdate(productId);

        final BigDecimal currentQuantity =
                getCurrentQuantity(inventory);

        inventory.setTotalQuantity(
                currentQuantity.add(request.getQuantity())
        );

        final Inventory updatedInventory =
                inventoryRepository.save(inventory);

        log.info(
                "Admin stock added successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponseDto removeStock(
            final String productId,
            final StockAdjustmentRequestDto request
    ) {

        log.info(
                "Admin stock removal requested for product: {}",
                productId
        );

        final Inventory inventory =
                findInventoryForUpdate(productId);

        final BigDecimal currentQuantity =
                getCurrentQuantity(inventory);

        final BigDecimal newQuantity =
                currentQuantity.subtract(request.getQuantity());

        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {

            log.warn(
                    "Admin stock removal rejected for product: {} because resulting quantity is negative",
                    productId
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_INSUFFICIENT_STOCK
            );
        }

        if (newQuantity.compareTo(
                inventory.getReservedQuantity()
        ) < 0) {

            log.warn(
                    "Admin stock removal rejected for product: {} because resulting quantity {} is less than reserved quantity {}",
                    productId,
                    newQuantity,
                    inventory.getReservedQuantity()
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_QUANTITY_LESS_THAN_RESERVED
            );
        }

        inventory.setTotalQuantity(newQuantity);

        final Inventory updatedInventory =
                inventoryRepository.save(inventory);

        log.info(
                "Admin stock removed successfully for product: {}",
                productId
        );

        return inventoryMapper.toResponseDto(updatedInventory);
    }

    private Inventory findInventory(
            final String productId
    ) {

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

    private Inventory findInventoryForUpdate(
            final String productId
    ) {

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

    private BigDecimal getCurrentQuantity(
            final Inventory inventory
    ) {

        if (inventory.getTotalQuantity() == null) {
            return BigDecimal.ZERO;
        }

        return inventory.getTotalQuantity();
    }
}