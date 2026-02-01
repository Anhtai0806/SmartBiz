package com.smartbiz.backend.dto;

import com.smartbiz.backend.entity.SalaryType;
import lombok.Data;

import java.math.BigDecimal;

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
