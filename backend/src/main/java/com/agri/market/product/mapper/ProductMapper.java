package com.agri.market.product.mapper;

import com.agri.market.category.entity.Category;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.repository.ProductImageRepository;
import com.agri.market.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductMapper {

    private final ProductImageRepository productImageRepository;
    private final ProductImageMapper productImageMapper;
    private final InventoryRepository inventoryRepository;

    public ProductResponseDto toResponseDto(
            final Product product
    ) {

        log.debug(
                "Mapping product to response DTO: {}",
                product.getId()
        );

        final User farmer = product.getFarmer();
        final Category category = product.getCategory();

        final var images =
                productImageRepository
                        .findAllByProduct_IdOrderByDisplayOrderAsc(
                                product.getId()
                        )
                        .stream()
                        .map(productImageMapper::toResponseDto)
                        .toList();

        final BigDecimal quantity = product.getId() != null
                ? inventoryRepository.findByProductId(product.getId())
                        .map(inv -> {
                            final BigDecimal total = inv.getTotalQuantity() != null ? inv.getTotalQuantity() : BigDecimal.ZERO;
                            final BigDecimal reserved = inv.getReservedQuantity() != null ? inv.getReservedQuantity() : BigDecimal.ZERO;
                            return total.subtract(reserved);
                        })
                        .orElse(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        return ProductResponseDto.builder()
                .id(product.getId())
                .farmerId(
                        farmer != null
                                ? farmer.getId()
                                : null
                )
                .farmerName(
                        farmer != null
                                ? farmer.getFullName()
                                : null
                )
                .categoryId(
                        category != null
                                ? category.getId()
                                : null
                )
                .categoryName(
                        category != null
                                ? category.getName()
                                : null
                )
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .unit(product.getUnit())
                .quantity(quantity)
                .location(product.getLocation())
                .status(product.getStatus())
                .images(images)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}