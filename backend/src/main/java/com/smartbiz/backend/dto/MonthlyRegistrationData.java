package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for monthly business owner registration statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRegistrationData {

    /**
     * Month name (e.g., "Jan 2026")
     */
    private String month;

    /**
     * Number of business owners registered in that month
     */
    private Long count;
}
