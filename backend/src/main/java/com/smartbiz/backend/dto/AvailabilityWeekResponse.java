package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWeekResponse {

    private Long submissionId;
    private UUID userId;
    private String userFullName;
    private Long storeId;
    private String storeName;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private boolean submitted;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<AvailabilitySlotResponse> slots = new ArrayList<>();
}
