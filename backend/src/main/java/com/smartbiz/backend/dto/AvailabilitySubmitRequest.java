package com.smartbiz.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySubmitRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    private LocalDate weekStart;

    @Valid
    @Builder.Default
    private List<AvailabilitySlotRequest> slots = new ArrayList<>();
}
