package com.smartbiz.backend.dto;

import com.smartbiz.backend.enums.TableStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotBlank(message = "Table name is required")
    private String name;

    @Builder.Default
    private TableStatus status = TableStatus.EMPTY;
}
