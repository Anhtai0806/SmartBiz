package com.smartbiz.backend.dto;

import com.smartbiz.backend.entity.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private String name;
    private TableStatus status;
    private Long currentOrderId;
}
