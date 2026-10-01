package com.agri.market.order.service;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.entity.Address;
import com.agri.market.address.mapper.AddressMapper;
import com.agri.market.address.repository.AddressRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.mapper.DeliveryMapper;
import com.agri.market.delivery.repository.DeliveryRepository;
import com.agri.market.email.service.EmailService;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.dto.OrderTrackingResponseDto;
import com.agri.market.order.dto.PlaceOrderRequestDto;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderAddressSnapshot;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.mapper.OrderMapper;
import com.agri.market.order.repository.OrderAddressSnapshotRepository;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.payment.service.PaymentService;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderAddressSnapshotRepository orderAddressSnapshotRepository;
    private final OrderMapper orderMapper;
    private final AddressMapper addressMapper;
    private final PaymentService paymentService;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final DeliveryMapper deliveryMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public OrderResponseDto placeOrder(
            final PlaceOrderRequestDto request,
            final String userId
    ) {

        log.info(
                "Placing order. User: {}, Product: {}, Quantity: {}",
                userId,
                request.getProductId(),
                request.getQuantity()
        );

        final User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.USER_NOT_FOUND
                                )
                        );

        final Product product =
                productRepository.findById(request.getProductId())
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.PRODUCT_NOT_FOUND
                                )
                        );

        validateProduct(product);

        final Address address =
                addressRepository.findByIdAndUserId(
                                request.getAddressId(),
                                userId
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.ADDRESS_NOT_FOUND
                                )
                        );

        final Inventory inventory =
                inventoryRepository.findByProductIdForUpdate(
                                product.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.INVENTORY_NOT_FOUND
                                )
                        );

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
                    "Order rejected due to insufficient stock. Product: {}, Requested: {}, Available: {}",
                    product.getId(),
                    request.getQuantity(),
                    availableQuantity
            );

            throw new BusinessException(
                    ErrorCode.INVENTORY_INSUFFICIENT_STOCK
            );
        }

        final BigDecimal unitPrice =
                product.getPrice();

        final BigDecimal subtotal =
                unitPrice.multiply(
                        request.getQuantity()
                );

        final Order order =
                Order.builder()
                        .user(user)
                        .status(OrderStatus.PENDING_PAYMENT)
                        .totalAmount(subtotal)
                        .build();

        final OrderAddressSnapshot addressSnapshot =
                OrderAddressSnapshot.builder()
                        .order(order)
                        .addressLine1(address.getAddressLine1())
                        .addressLine2(address.getAddressLine2())
                        .village(address.getVillage())
                        .city(address.getCity())
                        .district(address.getDistrict())
                        .state(address.getState())
                        .pincode(address.getPincode())
                        .country(address.getCountry())
                        .latitude(address.getLatitude())
                        .longitude(address.getLongitude())
                        .locationType(address.getLocationType())
                        .addressType(address.getAddressType())
                        .build();

        order.setAddressSnapshot(addressSnapshot);

        final OrderItem orderItem =
                OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(request.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .build();

        order.getItems().add(orderItem);

        inventory.setReservedQuantity(
                reservedQuantity.add(
                        request.getQuantity()
                )
        );

        inventoryRepository.save(inventory);

        final Order savedOrder =
                orderRepository.save(order);

        log.info(
                "Order placed and stock reserved. Order: {}, Product: {}, Reserved: {}",
                savedOrder.getId(),
                product.getId(),
                request.getQuantity()
        );

        return orderMapper.toResponseDto(
                savedOrder
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrder(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Fetching order: {} for user: {}",
                orderId,
                userId
        );

        final Order order =
                orderRepository.findByIdAndUserId(
                        orderId,
                        userId
                ).orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.ORDER_NOT_FOUND
                        )
                );

        return orderMapper.toResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDto getOrderAddress(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Fetching order address. Order: {}, User: {}",
                orderId,
                userId
        );

        final boolean isAdmin =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_ADMIN".equals(
                                        authority.getAuthority()
                                )
                        );

        final Order order;

        if (isAdmin) {
            order =
                    orderRepository.findById(orderId)
                            .orElseThrow(() ->
                                    new BusinessException(
                                            ErrorCode.ORDER_NOT_FOUND
                                    )
                            );
        } else {
            order =
                    orderRepository.findByIdAndUserId(
                                    orderId,
                                    userId
                            )
                            .orElseThrow(() ->
                                    new BusinessException(
                                            ErrorCode.ORDER_NOT_FOUND
                                    )
                            );
        }

        final OrderAddressSnapshot addressSnapshot =
                orderAddressSnapshotRepository.findByOrderId(
                                order.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.ADDRESS_NOT_FOUND
                                )
                        );

        return addressMapper.toSnapshotResponse(addressSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(
            final String userId
    ) {

        log.info(
                "Fetching orders for user: {}",
                userId
        );

        return orderRepository
                .findAllByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(orderMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(
            final String orderId,
            final String userId,
            final OrderStatusUpdateRequestDto request
    ) {

        log.info(
                "Updating order status. Order: {}, User: {}, Status: {}",
                orderId,
                userId,
                request.getStatus()
        );

        final Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.ORDER_NOT_FOUND
                                )
                        );

        validateSellerAccess(
                order,
                userId
        );

        validateStatusTransition(
                order.getStatus(),
                request.getStatus()
        );

        order.setStatus(
                request.getStatus()
        );

        final Order updatedOrder =
                orderRepository.save(order);

        if (request.getStatus() == OrderStatus.CANCELLED) {

            paymentService.refundPayment(
                    orderId,
                    order.getUser().getId()
            );

            log.info(
                    "Seller cancelled order and refund completed. Order: {}",
                    orderId
            );
        }

        if (request.getStatus() == OrderStatus.SHIPPED) {

            emailService.sendOrderShippedEmail(
                    order.getUser().getEmail(),
                    order.getId()
            );
        }

        if (request.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {

            emailService.sendOrderOutForDeliveryEmail(
                    order.getUser().getEmail(),
                    order.getId()
            );
        }

        return orderMapper.toResponseDto(
                updatedOrder
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderTrackingResponseDto trackMyOrder(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Tracking order: {} for user: {}",
                orderId,
                userId
        );

        final Order order =
                orderRepository.findByIdAndUserId(
                        orderId,
                        userId
                ).orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.ORDER_NOT_FOUND
                        )
                );

        final DeliveryResponseDto deliveryResponse =
                deliveryRepository.findByOrderId(
                                order.getId()
                        )
                        .map(deliveryMapper::toResponseDto)
                        .orElse(null);

        return OrderTrackingResponseDto.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdDate(order.getCreatedDate())
                .delivery(deliveryResponse)
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Cancelling order: {} for user: {}",
                orderId,
                userId
        );

        final Order order =
                orderRepository.findByIdAndUserId(
                        orderId,
                        userId
                ).orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.ORDER_NOT_FOUND
                        )
                );

        validateCancellation(order);

        final OrderStatus currentStatus =
                order.getStatus();

        order.setStatus(
                OrderStatus.CANCELLED
        );

        orderRepository.save(order);

        if (currentStatus == OrderStatus.PENDING_PAYMENT) {

            releaseReservedQuantity(order);

            emailService.sendOrderCancellationEmail(
                    order.getUser().getEmail(),
                    order.getId(),
                    order.getTotalAmount().toString()
            );

            for (final OrderItem orderItem : order.getItems()) {

                emailService.sendProductOrderCancellationEmail(
                        orderItem.getProduct()
                                .getFarmer()
                                .getEmail(),
                        order.getId(),
                        orderItem.getProduct().getName(),
                        orderItem.getQuantity().toString()
                );
            }

            log.info(
                    "Pending payment order cancelled and reservation released. Order: {}",
                    orderId
            );

            return;
        }

        paymentService.refundPayment(
                orderId,
                userId
        );

        log.info(
                "Order cancellation and payment refund completed. Order: {}",
                orderId
        );
    }

    private void releaseReservedQuantity(
            final Order order
    ) {

        for (final OrderItem orderItem : order.getItems()) {

            final Product product =
                    orderItem.getProduct();

            final Inventory inventory =
                    inventoryRepository.findByProductIdForUpdate(
                                    product.getId()
                            )
                            .orElseThrow(() ->
                                    new BusinessException(
                                            ErrorCode.INVENTORY_NOT_FOUND
                                    )
                            );

            final BigDecimal reservedQuantity =
                    inventory.getReservedQuantity() == null
                            ? BigDecimal.ZERO
                            : inventory.getReservedQuantity();

            final BigDecimal newReservedQuantity =
                    reservedQuantity.subtract(
                            orderItem.getQuantity()
                    );

            if (newReservedQuantity.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                throw new BusinessException(
                        ErrorCode.INVENTORY_INSUFFICIENT_STOCK
                );
            }

            inventory.setReservedQuantity(
                    newReservedQuantity
            );

            inventoryRepository.save(inventory);
        }
    }

    private void validateProduct(
            final Product product
    ) {

        if (!ProductStatus.ACTIVE.name().equals(product.getStatus())) {

            throw new BusinessException(
                    ErrorCode.PRODUCT_NOT_AVAILABLE
            );
        }

        if (product.getPrice() == null
                || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    ErrorCode.PRODUCT_NOT_AVAILABLE
            );
        }
    }

    private void validateSellerAccess(
            final Order order,
            final String userId
    ) {

        final boolean belongsToUser =
                order.getItems()
                        .stream()
                        .anyMatch(orderItem ->
                                orderItem.getProduct()
                                        .getFarmer()
                                        .getId()
                                        .equals(userId)
                        );

        if (!belongsToUser) {

            throw new BusinessException(
                    ErrorCode.ORDER_ACCESS_DENIED
            );
        }
    }

    private void validateStatusTransition(
            final OrderStatus currentStatus,
            final OrderStatus newStatus
    ) {

        if (currentStatus == OrderStatus.DELIVERED
                || currentStatus == OrderStatus.CANCELLED) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }

        if (newStatus == OrderStatus.CANCELLED) {

            if (currentStatus != OrderStatus.CONFIRMED) {

                throw new BusinessException(
                        ErrorCode.ORDER_INVALID_STATUS_TRANSITION
                );
            }

            return;
        }

        if (currentStatus == OrderStatus.CONFIRMED
                && newStatus != OrderStatus.PROCESSING) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }

        if (currentStatus == OrderStatus.PROCESSING
                && newStatus != OrderStatus.SHIPPED) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }

        if (currentStatus == OrderStatus.SHIPPED
                && newStatus != OrderStatus.OUT_FOR_DELIVERY) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }

        if (currentStatus == OrderStatus.OUT_FOR_DELIVERY
                && newStatus != OrderStatus.DELIVERED) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }
    }

    private void validateCancellation(
            final Order order
    ) {

        final OrderStatus status =
                order.getStatus();

        if (status != OrderStatus.PENDING_PAYMENT
                && status != OrderStatus.CONFIRMED
                && status != OrderStatus.PROCESSING) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }
    }
}