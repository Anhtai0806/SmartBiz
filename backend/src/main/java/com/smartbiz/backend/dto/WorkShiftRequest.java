package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating shift templates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkShiftRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotBlank(message = "Shift name is required")
    private String name; // e.g., "Ca sáng", "Ca chiều", "Ca tối"

    @NotBlank(message = "Start time is required")
    private String startTime; // Format: "HH:mm" e.g., "08:00"

    @NotBlank(message = "End time is required")
    private String endTime; // Format: "HH:mm" e.g., "12:00"
}
