package com.smartbiz.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.smartbiz.backend.enums.PaymentMethod;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @ToString.Exclude
    private Invoice invoice;

    @Column(name = "transaction_code", unique = true, nullable = false, length = 50)
    private String transactionCode;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "vnpay_transaction_no", length = 50)
    private String vnpayTransactionNo;

    @Column(name = "vnpay_bank_code", length = 20)
    private String vnpayBankCode;

    @Column(name = "vnpay_card_type", length = 20)
    private String vnpayCardType;

    @Column(name = "vnpay_response_code", length = 10)
    private String vnpayResponseCode;

    @Column(name = "vnpay_secure_hash")
    private String vnpaySecureHash;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED
    }
}
