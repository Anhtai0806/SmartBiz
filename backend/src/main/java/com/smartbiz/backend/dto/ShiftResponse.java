package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftResponse {

    private Long id;
    private UUID userId;
    private String userFullName;
    private String userRole;
    private Long storeId;
    private String storeName;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
}
