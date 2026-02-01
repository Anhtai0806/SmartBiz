package com.smartbiz.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for bulk creating tables
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkCreateTablesRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotNull(message = "Count is required")
    @Min(value = 1, message = "Count must be at least 1")
    private Integer count;

    private Integer startNumber; // Optional, defaults to 1 or next available
}
