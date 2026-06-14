package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating store information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStoreRequest {

    @jakarta.validation.constraints.Size(max = 100, message = "Branch name must not exceed 100 characters")
    private String branchName;

    private String address;

    @jakarta.validation.constraints.Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    private java.math.BigDecimal taxRate;

    private java.time.LocalTime openingTime;

    private java.time.LocalTime closingTime;

    private Boolean status;
}
