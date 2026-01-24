package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TablesRepository tablesRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;

    /**
     * Get all tables for a store
     */
    public List<TableResponse> getTablesByStore(Long storeId) {
        List<Tables> tables = tablesRepository.findByStoreId(storeId);
        return tables.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new table (BUSINESS_OWNER only)
     */
    @Transactional
    public TableResponse createTable(UUID ownerId, TableRequest request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create tables for this store");
        }

        Tables table = Tables.builder()
                .store(store)
                .name(request.getName())
                .status(request.getStatus())
                .build();

        Tables saved = tablesRepository.save(table);
        return convertToResponse(saved);
    }

    /**
     * Update table status (STAFF, CASHIER can update)
     */
    @Transactional
    public TableResponse updateTableStatus(Long tableId, TableStatusRequest request) {
        Tables table = tablesRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        table.setStatus(request.getStatus());
        Tables updated = tablesRepository.save(table);
        return convertToResponse(updated);
    }

    /**
     * Delete a table (BUSINESS_OWNER only)
     */
    @Transactional
    public void deleteTable(UUID ownerId, Long tableId) {
        Tables table = tablesRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        // Verify ownership
        if (!table.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this table");
        }

        tablesRepository.delete(table);
    }

    /**
     * Convert Tables entity to response DTO
     */
    private TableResponse convertToResponse(Tables table) {
        // Find current active order for this table
        Long currentOrderId = orderRepository.findActiveOrderByTableId(table.getId())
                .map(Order::getId)
                .orElse(null);

        return TableResponse.builder()
                .id(table.getId())
                .storeId(table.getStore().getId())
                .storeName(table.getStore().getName())
                .name(table.getName())
                .status(table.getStatus())
                .currentOrderId(currentOrderId)
                .build();
    }
}
