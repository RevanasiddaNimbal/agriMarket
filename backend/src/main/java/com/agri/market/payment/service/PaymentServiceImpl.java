package com.agri.market.payment.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.service.DeliveryService;
import com.agri.market.email.service.EmailService;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.payment.dto.PaymentRequestDto;
import com.agri.market.payment.dto.PaymentResponseDto;
import com.agri.market.payment.dto.RefundResponseDto;
import com.agri.market.payment.entity.Payment;
import com.agri.market.payment.entity.PaymentStatus;
import com.agri.market.payment.entity.PaymentTransaction;
import com.agri.market.payment.entity.TransactionType;
import com.agri.market.payment.mapper.PaymentMapper;
import com.agri.market.payment.provider.PaymentProvider;
import com.agri.market.payment.provider.PaymentProviderFactory;
import com.agri.market.payment.provider.PaymentProviderResponse;
import com.agri.market.payment.repository.PaymentRepository;
import com.agri.market.payment.repository.PaymentTransactionRepository;
import com.agri.market.product.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentProviderFactory paymentProviderFactory;
    private final DeliveryService deliveryService;
    private final EmailService emailService;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public PaymentResponseDto processPayment(
            final String orderId,
            final String userId,
            final PaymentRequestDto request
    ) {

        log.info(
                "Processing payment. Order: {}, User: {}",
                orderId,
                userId
        );

        final Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.ORDER_NOT_FOUND
                                )
                        );

        if (!order.getUser().getId().equals(userId)) {

            throw new BusinessException(
                    ErrorCode.ORDER_ACCESS_DENIED
            );
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {

            throw new BusinessException(
                    ErrorCode.ORDER_INVALID_STATUS_TRANSITION
            );
        }

        if (paymentRepository.existsByOrderId(orderId)) {

            throw new BusinessException(
                    ErrorCode.PAYMENT_ALREADY_EXISTS
            );
        }

        final PaymentProvider provider =
                paymentProviderFactory.getProvider();

        final PaymentProviderResponse providerResponse =
                provider.processPayment(
                        orderId,
                        order.getTotalAmount(),
                        request.getPaymentMethod()
                );

        final Payment payment =
                Payment.builder()
                        .order(order)
                        .amount(order.getTotalAmount())
                        .paymentMethod(request.getPaymentMethod())
                        .status(
                                providerResponse.isSuccessful()
                                        ? PaymentStatus.SUCCESS
                                        : PaymentStatus.FAILED
                        )
                        .provider(
                                providerResponse.getProvider()
                        )
                        .providerPaymentId(
                                providerResponse.getProviderPaymentId()
                        )
                        .paidAt(
                                providerResponse.isSuccessful()
                                        ? LocalDateTime.now()
                                        : null
                        )
                        .build();

        final Payment savedPayment =
                paymentRepository.save(payment);

        final PaymentTransaction transaction =
                PaymentTransaction.builder()
                        .payment(savedPayment)
                        .transactionType(TransactionType.PAYMENT)
                        .amount(order.getTotalAmount())
                        .status(
                                providerResponse.isSuccessful()
                                        ? PaymentStatus.SUCCESS
                                        : PaymentStatus.FAILED
                        )
                        .provider(
                                providerResponse.getProvider()
                        )
                        .providerTransactionId(
                                providerResponse.getProviderTransactionId()
                        )
                        .build();

        paymentTransactionRepository.save(transaction);

        if (!providerResponse.isSuccessful()) {

            releaseReservedQuantity(order);

            order.setStatus(
                    OrderStatus.CANCELLED
            );

            orderRepository.save(order);

            log.warn(
                    "Payment failed and reservation released. Order: {}",
                    orderId
            );

            throw new BusinessException(
                    ErrorCode.PAYMENT_FAILED
            );
        }

        deductSoldQuantity(order);

        order.setStatus(
                OrderStatus.CONFIRMED
        );

        orderRepository.save(order);

        deliveryService.createDelivery(
                order
        );

        emailService.sendOrderConfirmationEmail(
                order.getUser().getEmail(),
                order.getId(),
                order.getTotalAmount().toString()
        );

        for (final OrderItem orderItem : order.getItems()) {

            emailService.sendProductBookedEmail(
                    orderItem.getProduct()
                            .getFarmer()
                            .getEmail(),
                    order.getId(),
                    orderItem.getProduct().getName(),
                    orderItem.getQuantity().toString()
            );
        }

        log.info(
                "Payment completed successfully. Order: {}, Payment: {}",
                orderId,
                savedPayment.getId()
        );

        return paymentMapper.toResponseDto(
                savedPayment
        );
    }

    @Override
    @Transactional
    public RefundResponseDto refundPayment(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Processing refund. Order: {}, User: {}",
                orderId,
                userId
        );

        final Payment payment =
                paymentRepository.findByOrderId(orderId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.PAYMENT_NOT_FOUND
                                )
                        );

        final Order order =
                payment.getOrder();

        if (!order.getUser().getId().equals(userId)) {

            throw new BusinessException(
                    ErrorCode.ORDER_ACCESS_DENIED
            );
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {

            throw new BusinessException(
                    ErrorCode.PAYMENT_REFUND_NOT_ALLOWED
            );
        }

        if (order.getStatus() != OrderStatus.CANCELLED) {

            throw new BusinessException(
                    ErrorCode.PAYMENT_REFUND_NOT_ALLOWED
            );
        }

        final PaymentProvider provider =
                paymentProviderFactory.getProvider();

        final PaymentProviderResponse providerResponse =
                provider.processRefund(
                        payment.getProviderPaymentId(),
                        payment.getAmount()
                );

        if (!providerResponse.isSuccessful()) {

            throw new BusinessException(
                    ErrorCode.PAYMENT_REFUND_FAILED
            );
        }

        restoreSoldQuantity(order);

        payment.setStatus(
                PaymentStatus.REFUNDED
        );

        payment.setRefundedAt(
                LocalDateTime.now()
        );

        paymentRepository.save(payment);

        final PaymentTransaction refundTransaction =
                PaymentTransaction.builder()
                        .payment(payment)
                        .transactionType(TransactionType.REFUND)
                        .amount(payment.getAmount())
                        .status(PaymentStatus.REFUNDED)
                        .provider(
                                providerResponse.getProvider()
                        )
                        .providerTransactionId(
                                providerResponse.getProviderTransactionId()
                        )
                        .build();

        paymentTransactionRepository.save(
                refundTransaction
        );

        emailService.sendOrderCancellationEmail(
                order.getUser().getEmail(),
                order.getId(),
                payment.getAmount().toString()
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
                "Refund completed successfully. Order: {}, Payment: {}",
                orderId,
                payment.getId()
        );

        return paymentMapper.toRefundResponseDto(
                payment
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPayment(
            final String orderId,
            final String userId
    ) {

        log.info(
                "Fetching payment for order: {}, User: {}",
                orderId,
                userId
        );

        final Payment payment =
                paymentRepository.findByOrderId(
                        orderId
                ).orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.PAYMENT_NOT_FOUND
                        )
                );

        if (!payment.getOrder()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(
                    ErrorCode.ORDER_ACCESS_DENIED
            );
        }

        return paymentMapper.toResponseDto(
                payment
        );
    }

    private void deductSoldQuantity(
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

            final BigDecimal productQuantity =
                    product.getQuantity() == null
                            ? BigDecimal.ZERO
                            : product.getQuantity();

            final BigDecimal reservedQuantity =
                    inventory.getReservedQuantity() == null
                            ? BigDecimal.ZERO
                            : inventory.getReservedQuantity();

            if (reservedQuantity.compareTo(
                    orderItem.getQuantity()
            ) < 0) {

                throw new BusinessException(
                        ErrorCode.INVENTORY_INSUFFICIENT_STOCK
                );
            }

            if (productQuantity.compareTo(
                    orderItem.getQuantity()
            ) < 0) {

                throw new BusinessException(
                        ErrorCode.INVENTORY_INSUFFICIENT_STOCK
                );
            }

            product.setQuantity(
                    productQuantity.subtract(
                            orderItem.getQuantity()
                    )
            );

            inventory.setReservedQuantity(
                    reservedQuantity.subtract(
                            orderItem.getQuantity()
                    )
            );

            inventoryRepository.save(inventory);
        }
    }

    private void releaseReservedQuantity(
            final Order order
    ) {

        for (final OrderItem orderItem : order.getItems()) {

            final Inventory inventory =
                    inventoryRepository.findByProductIdForUpdate(
                                    orderItem.getProduct().getId()
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

    private void restoreSoldQuantity(
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

            final BigDecimal productQuantity =
                    product.getQuantity() == null
                            ? BigDecimal.ZERO
                            : product.getQuantity();

            product.setQuantity(
                    productQuantity.add(
                            orderItem.getQuantity()
                    )
            );

            inventoryRepository.save(inventory);
        }
    }
}