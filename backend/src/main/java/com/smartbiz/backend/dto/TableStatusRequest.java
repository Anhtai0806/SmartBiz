package com.smartbiz.backend.dto;

import com.smartbiz.backend.enums.TableStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableStatusRequest {

    @NotNull(message = "Status is required")
    private TableStatus status;
}
