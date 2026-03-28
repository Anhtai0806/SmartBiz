package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.TableStatus;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TablesRepository tablesRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final StaffShiftRepository staffShiftRepository;

    /**
     * Get all tables for a store
     */
    public List<TableResponse> getTablesByStore(@NonNull Long storeId) {
        List<Tables> tables = tablesRepository.findByStoreId(requireValue(storeId, "storeId"));
        return tables.stream()
                .map(table -> convertToResponse(requireValue(table, "table")))
                .collect(Collectors.toList());
    }

    /**
     * Create a new table (BUSINESS_OWNER only)
     */
    @Transactional
    public TableResponse createTable(@NonNull UUID ownerId, @NonNull TableRequest request) {
        Long storeId = requireValue(request.getStoreId(), "storeId");
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create tables for this store");
        }

        Tables table = requireValue(Tables.builder()
                .store(store)
                .name(request.getName())
                .status(request.getStatus())
                .build(), "table");

        Tables saved = tablesRepository.save(requireValue(table, "table"));
        return convertToResponse(requireValue(saved, "savedTable"));
    }

    /**
     * Bulk create tables with auto-generated names (BUSINESS_OWNER only)
     */
    @Transactional
    public List<TableResponse> bulkCreateTables(@NonNull UUID ownerId, @NonNull BulkCreateTablesRequest request) {
        Long storeId = requireValue(request.getStoreId(), "storeId");
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create tables for this store");
        }

        // Determine starting number
        int startNumber = request.getStartNumber() != null ? request.getStartNumber() : 1;

        // If startNumber is not provided, find the next available number
        if (request.getStartNumber() == null) {
            List<Tables> existingTables = tablesRepository.findByStoreId(storeId);
            // Find highest table number
            int maxNumber = existingTables.stream()
                    .map(Tables::getName)
                    .filter(name -> name.matches("Bàn \\d+"))
                    .map(name -> name.replaceAll("Bàn ", ""))
                    .mapToInt(Integer::parseInt)
                    .max()
                    .orElse(0);
            startNumber = maxNumber + 1;
        }

        // Create tables
        List<Tables> tables = new java.util.ArrayList<>();
        for (int i = 0; i < request.getCount(); i++) {
            Tables table = Tables.builder()
                    .store(store)
                    .name("Bàn " + (startNumber + i))
                    .status(TableStatus.EMPTY)
                    .build();
            tables.add(table);
        }

        List<Tables> savedTables = tablesRepository.saveAll(tables);
        return savedTables.stream()
                .map(table -> convertToResponse(requireValue(table, "table")))
                .collect(Collectors.toList());
    }

    /**
     * Update table status (STAFF, CASHIER can update)
     */
    @Transactional
    public TableResponse updateTableStatus(@NonNull Long tableId, @NonNull TableStatusRequest request,
            @NonNull UUID userId, String role) {
        Tables table = tablesRepository.findById(requireValue(tableId, "tableId"))
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        // Validate working hours for STAFF and CASHIER
        if ("ROLE_STAFF".equals(role) || "ROLE_CASHIER".equals(role)) {
            validateWorkingHours(userId, requireValue(table.getStore().getId(), "store.id"));
        }

        table.setStatus(request.getStatus());
        Tables updated = tablesRepository.save(requireValue(table, "table"));
        return convertToResponse(requireValue(updated, "updatedTable"));
    }

    /**
     * Delete a table (BUSINESS_OWNER only)
     */
    @Transactional
    public void deleteTable(@NonNull UUID ownerId, @NonNull Long tableId) {
        Tables table = tablesRepository.findById(requireValue(tableId, "tableId"))
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        // Verify ownership
        if (!table.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this table");
        }

        tablesRepository.delete(requireValue(table, "table"));
    }

    /**
     * Validate if user is currently within their working hours
     */
    private void validateWorkingHours(@NonNull UUID userId, @NonNull Long storeId) {
        // Find shifts for today
        List<StaffShift> userShifts = staffShiftRepository.findByUserIdAndShiftDate(
                userId,
                LocalDate.now());

        if (userShifts.isEmpty()) {
            throw new IllegalArgumentException(
                    "Bạn không có ca làm việc hôm nay. Chỉ có thể xem thông tin bàn.");
        }

        // Check if current time is within any shift
        LocalTime now = LocalTime.now();
        boolean isWithinShift = false;

        for (StaffShift shift : userShifts) {
            LocalTime start = shift.getStartTime();
            LocalTime end = shift.getEndTime();

            if (start.isBefore(end)) {
                // Normal shift (e.g., 08:00 to 16:00)
                if (!now.isBefore(start) && !now.isAfter(end)) {
                    isWithinShift = true;
                    break;
                }
            } else {
                // Overnight shift (e.g., 22:00 to 06:00)
                if (!now.isBefore(start) || !now.isAfter(end)) {
                    isWithinShift = true;
                    break;
                }
            }
        }

        if (!isWithinShift) {
            StringBuilder shiftTimes = new StringBuilder();
            for (int i = 0; i < userShifts.size(); i++) {
                if (i > 0)
                    shiftTimes.append(", ");
                shiftTimes.append(userShifts.get(i).getStartTime())
                        .append(" - ")
                        .append(userShifts.get(i).getEndTime());
            }
            throw new IllegalArgumentException(
                    "Hiện tại không nằm trong khung giờ làm việc của bạn. Các ca làm việc hôm nay: "
                            + shiftTimes.toString());
        }
    }

    /**
     * Check if user is currently in working hours
     */
    public boolean isInWorkingHours(@NonNull UUID userId) {
        try {
            List<StaffShift> userShifts = staffShiftRepository.findByUserIdAndShiftDate(
                    userId,
                    LocalDate.now());

            if (userShifts.isEmpty()) {
                return false;
            }

            LocalTime now = LocalTime.now();
            for (StaffShift shift : userShifts) {
                LocalTime start = shift.getStartTime();
                LocalTime end = shift.getEndTime();

                if (start.isBefore(end)) {
                    // Normal shift
                    if (!now.isBefore(start) && !now.isAfter(end)) {
                        return true;
                    }
                } else {
                    // Overnight shift
                    if (!now.isBefore(start) || !now.isAfter(end)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Convert Tables entity to response DTO
     */
    private TableResponse convertToResponse(@NonNull Tables table) {
        // Find current active order for this table
        Long tableId = requireValue(table.getId(), "table.id");
        List<Order> activeOrders = orderRepository.findActiveOrderByTableId(tableId);
        Long currentOrderId = activeOrders.isEmpty() ? null : activeOrders.get(0).getId();

        return TableResponse.builder()
                .id(table.getId())
                .storeId(table.getStore().getId())
                .storeName(table.getStore().getName())
                .name(table.getName())
                .status(table.getStatus())
                .currentOrderId(currentOrderId)
                .build();
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
