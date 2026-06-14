package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotRequest {

    @NotNull(message = "Available date is required")
    private LocalDate availableDate;

    @NotNull(message = "Work shift ID is required")
    private Long workShiftId;
}
