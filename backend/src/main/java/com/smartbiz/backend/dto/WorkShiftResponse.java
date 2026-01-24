package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for shift templates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkShiftResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private String name; // e.g., "Ca sáng", "Ca chiều", "Ca tối"
    private String startTime; // Format: "HH:mm" e.g., "08:00"
    private String endTime; // Format: "HH:mm" e.g., "12:00"
}
