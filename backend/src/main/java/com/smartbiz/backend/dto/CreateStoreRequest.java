package com.smartbiz.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStoreRequest {

    @Size(max = 100, message = "Branch name must not exceed 100 characters")
    private String branchName;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    private java.math.BigDecimal taxRate;

    private java.time.LocalTime openingTime;

    private java.time.LocalTime closingTime;
}
