package com.smartbiz.backend.dto;

import lombok.Data;

import com.smartbiz.backend.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
