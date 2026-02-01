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
public class CashierDashboardStatsResponse {

    private Long totalOrders;
    private Long completedOrders;
    private Long pendingPayments;
    private BigDecimal todayRevenue;
}
