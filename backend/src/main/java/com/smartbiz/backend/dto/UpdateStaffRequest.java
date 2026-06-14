package com.smartbiz.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

import com.smartbiz.backend.enums.SalaryType;

@Data
public class UpdateStaffRequest {
    @Email(message = "Email must be valid")
    private String email;
    private String role;
    private SalaryType salaryType;
    private BigDecimal salaryAmount;
    @Positive(message = "Store ID must be greater than 0")
    private Long storeId;
}
