package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    @NotNull(message = "Table ID is required")
    private Long tableId;

    @NotNull(message = "Shift ID is required")
    private Long shiftId;

    private List<OrderItemRequest> items;
}
