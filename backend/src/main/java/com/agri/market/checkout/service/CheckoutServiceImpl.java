package com.agri.market.checkout.service;

import com.agri.market.address.entity.Address;
import com.agri.market.address.repository.AddressRepository;
import com.agri.market.checkout.dto.CheckoutRequestDto;
import com.agri.market.checkout.dto.CheckoutResponseDto;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutServiceImpl implements CheckoutService {

    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public CheckoutResponseDto checkout(
            final CheckoutRequestDto request,
            final String userId
    ) {

        log.info(
                "Checkout request received for user: {}, product: {}",
                userId,
                request.getProductId()
        );

        final Product product =
                productRepository.findById(request.getProductId())
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found during checkout: {}",
                                    request.getProductId()
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        validateProduct(product);

        final Address address =
                addressRepository.findByIdAndUserId(
                                request.getAddressId(),
                                userId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Address not found or does not belong to user. Address: {}, User: {}",
                                    request.getAddressId(),
                                    userId
                            );

                            return new BusinessException(
                                    ErrorCode.ADDRESS_NOT_FOUND
                            );
                        });

        final Inventory inventory =
                inventoryRepository.findByProductIdForUpdate(
                                product.getId()
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Inventory not found during checkout for product: {}",
                                    product.getId()
                            );

                            return new BusinessException(
                                    ErrorCode.INVENTORY_NOT_FOUND
                            );
                        });

        final BigDecimal totalQuantity =
                inventory.getTotalQuantity() == null
                        ? BigDecimal.ZERO
                        : inventory.getTotalQuantity();

        final BigDecimal reservedQuantity =
                inventory.getReservedQuantity() == null
                        ? BigDecimal.ZERO
                        : inventory.getReservedQuantity();

        final BigDecimal availableQuantity =
                totalQuantity.subtract(reservedQuantity);

        if (request.getQuantity().compareTo(availableQuantity) > 0) {

            log.warn(
                    "Checkout rejected due to insufficient stock. Product: {}, Requested: {}, Available: {}",
                    product.getId(),
                    request.getQuantity(),
                    availableQuantity
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_INSUFFICIENT_STOCK
            );
        }

        final BigDecimal totalAmount =
                product.getPrice().multiply(request.getQuantity());

        log.info(
                "Checkout validation successful for user: {}, product: {}, quantity: {}, total amount: {}",
                userId,
                product.getId(),
                request.getQuantity(),
                totalAmount
        );

        return CheckoutResponseDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantity(request.getQuantity())
                .unitPrice(product.getPrice())
                .totalAmount(totalAmount)
                .addressId(address.getId())
                .status("READY_FOR_PAYMENT")
                .build();
    }

    private void validateProduct(
            final Product product
    ) {

        if (!ProductStatus.ACTIVE.name().equals(product.getStatus())) {

            log.warn(
                    "Checkout rejected because product is not active: {}",
                    product.getId()
            );

            throw new BusinessException(
                    ErrorCode.PRODUCT_NOT_AVAILABLE
            );
        }

        if (product.getPrice() == null
                || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {

            log.warn(
                    "Checkout rejected because product price is invalid: {}",
                    product.getId()
            );

            throw new BusinessException(
                    ErrorCode.PRODUCT_NOT_AVAILABLE
            );
        }
    }
}