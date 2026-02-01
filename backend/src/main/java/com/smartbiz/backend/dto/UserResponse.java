package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.smartbiz.backend.entity.SalaryType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id; // Keep UUID for User
    private String email;
    private String phone;
    private String fullName;
    private String role;
    private String status;
    private SalaryType salaryType;
    private BigDecimal salaryAmount;
    private LocalDateTime createdAt;
}
