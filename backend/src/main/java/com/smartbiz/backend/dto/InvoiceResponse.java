package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.smartbiz.backend.enums.PaymentMethod;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

    private Long id;
    private Long orderId;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
    private OrderResponse order;
}
