package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDetailResponse {

    private Long id;
    private String name;
    private String address;
    private UUID ownerId;
    private String ownerName;
    private List<UserResponse> staffMembers;
    private List<MenuItemResponse> menuItems;
    private List<TableResponse> tables;
    private LocalDateTime createdAt;
}
