package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {
    private String date; // Using String for flexible period representation (Product request:
                         // day/month/year)
    private BigDecimal revenue;
    private Long orderCount;
}
