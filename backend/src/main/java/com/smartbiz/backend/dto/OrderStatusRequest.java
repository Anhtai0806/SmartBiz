package com.smartbiz.backend.dto;

import com.smartbiz.backend.enums.OrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;
}
