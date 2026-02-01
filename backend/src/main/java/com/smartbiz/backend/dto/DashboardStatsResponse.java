package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private Long totalUsers;
    private Long totalStores;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long newBusinessOwnersThisMonth;
    private List<MonthlyRegistrationData> businessOwnerTrend;
}
