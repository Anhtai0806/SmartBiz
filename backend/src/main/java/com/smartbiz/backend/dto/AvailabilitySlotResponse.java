package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotResponse {

    private Long id;
    private LocalDate availableDate;
    private Long workShiftId;
    private String workShiftName;
    private String startTime;
    private String endTime;
}
