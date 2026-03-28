package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private java.math.BigDecimal taxRate;
    private java.time.LocalTime openingTime;
    private java.time.LocalTime closingTime;
    private UUID ownerId;
    private String ownerName;
    private String ownerEmail;
    private Boolean status;
    private Integer staffCount;
    private Integer tableCount;
    private LocalDateTime createdAt;
}
