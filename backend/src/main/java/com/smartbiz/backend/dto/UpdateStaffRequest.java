package com.smartbiz.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

import com.smartbiz.backend.enums.SalaryType;

@Data
public class UpdateStaffRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String address;
    private SalaryType salaryType;
    private BigDecimal salaryAmount;
}
