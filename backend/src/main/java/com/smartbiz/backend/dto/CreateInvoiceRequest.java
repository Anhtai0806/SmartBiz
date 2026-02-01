package com.smartbiz.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import com.smartbiz.backend.entity.PaymentMethod;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
