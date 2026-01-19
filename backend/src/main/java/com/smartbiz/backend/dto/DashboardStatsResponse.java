package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private Long totalUsers;
    private Long totalStores;
    private Long activeUsers;
    private Long inactiveUsers;
    private Map<String, Long> usersByRole;
}
