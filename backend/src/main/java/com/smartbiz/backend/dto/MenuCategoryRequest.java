package com.smartbiz.backend.dto;

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
public class MenuCategoryRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotBlank(message = "Category name is required")
    private String name;
}
