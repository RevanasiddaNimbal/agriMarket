package com.agri.market.inventory.mapper;

import com.agri.market.inventory.dto.InventoryResponseDto;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.product.entity.ProductStatus;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@NoArgsConstructor
public class InventoryMapper {

    public InventoryResponseDto toResponseDto(
            final Inventory inventory
    ) {

        final BigDecimal totalQuantity =
                inventory.getTotalQuantity() != null
                        ? inventory.getTotalQuantity()
                        : BigDecimal.ZERO;

        final BigDecimal reservedQuantity =
                inventory.getReservedQuantity() != null
                        ? inventory.getReservedQuantity()
                        : BigDecimal.ZERO;

        final BigDecimal availableQuantity =
                totalQuantity.subtract(reservedQuantity);

        return InventoryResponseDto.builder()
                .productId(inventory.getProduct().getId())
                .availableQuantity(availableQuantity)
                .reservedQuantity(reservedQuantity)
                .unit(inventory.getProduct().getUnit())
                .available(
                        ProductStatus.ACTIVE.name().equals(
                                inventory.getProduct().getStatus()
                        )
                                && availableQuantity.compareTo(
                                BigDecimal.ZERO
                        ) > 0
                )
                .build();
    }
}