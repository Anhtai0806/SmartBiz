package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Store name is required")
    private String name;

    private String address;

    @jakarta.validation.constraints.Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    private java.math.BigDecimal taxRate;

    private java.time.LocalTime openingTime;

    private java.time.LocalTime closingTime;

    private Boolean status;
}
