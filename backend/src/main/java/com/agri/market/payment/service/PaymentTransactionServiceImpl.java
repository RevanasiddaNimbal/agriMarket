package com.agri.market.payment.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.payment.dto.PaymentTransactionResponseDto;
import com.agri.market.payment.mapper.PaymentTransactionMapper;
import com.agri.market.payment.repository.PaymentRepository;
import com.agri.market.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentTransactionServiceImpl
        implements PaymentTransactionService {

    private final PaymentTransactionRepository
            paymentTransactionRepository;

    private final PaymentRepository paymentRepository;

    private final PaymentTransactionMapper
            paymentTransactionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponseDto> getMyTransactions(
            final String userId
    ) {

        log.info(
                "Fetching payment transactions for user: {}",
                userId
        );

        return paymentTransactionRepository
                .findAllByPaymentOrderUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(paymentTransactionMapper::toResponseDto)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponseDto> getPaymentTransactions(
            final String paymentId,
            final String userId
    ) {

        log.info(
                "Fetching transactions for payment: {} by user: {}",
                paymentId,
                userId
        );

        paymentRepository
                .findByIdAndOrderUserId(
                        paymentId,
                        userId
                )
                .orElseThrow(() -> {
                    log.warn(
                            "Payment not found or does not belong to user. Payment: {}, User: {}",
                            paymentId,
                            userId
                    );

                    return new BusinessException(
                            ErrorCode.PAYMENT_NOT_FOUND
                    );
                });

        return paymentTransactionRepository
                .findAllByPaymentIdOrderByCreatedDateDesc(
                        paymentId
                )
                .stream()
                .map(paymentTransactionMapper::toResponseDto)
                .toList();
    }
}