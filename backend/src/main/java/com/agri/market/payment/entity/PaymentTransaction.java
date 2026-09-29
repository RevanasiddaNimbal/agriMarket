package com.agri.market.payment.entity;

import com.agri.market.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "payment_transactions",
        indexes = {
                @Index(
                        name = "idx_payment_transactions_payment_id",
                        columnList = "payment_id"
                ),
                @Index(
                        name = "idx_payment_transactions_type",
                        columnList = "transaction_type"
                ),
                @Index(
                        name = "idx_payment_transactions_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_payment_transactions_provider_transaction_id",
                        columnList = "provider_transaction_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "payment_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_payment_transaction_payment")
    )
    private Payment payment;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 30
    )
    private TransactionType transactionType;

    @Column(
            name = "amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private PaymentStatus status;

    @Column(
            name = "provider",
            nullable = false,
            length = 50
    )
    private String provider;

    @Column(
            name = "provider_transaction_id",
            unique = true,
            length = 100
    )
    private String providerTransactionId;
}