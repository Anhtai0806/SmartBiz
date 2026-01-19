package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignStaffRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Store ID is required")
    private Long storeId;
}
