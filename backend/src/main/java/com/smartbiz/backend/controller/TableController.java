package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Table Management endpoints
 */
@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    /**
     * Get all tables for a store
     */
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<TableResponse>> getTablesByStore(@PathVariable @NonNull Long storeId) {
        List<TableResponse> tables = tableService.getTablesByStore(storeId);
        return ResponseEntity.ok(tables);
    }

    /**
     * Create a new table (BUSINESS_OWNER only)
     */
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<TableResponse> createTable(@Valid @RequestBody @NonNull TableRequest request) {
        User currentUser = getCurrentUser();
        TableResponse table = tableService.createTable(getCurrentUserId(currentUser), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(table);
    }

    /**
     * Bulk create tables (BUSINESS_OWNER only)
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<TableResponse>> bulkCreateTables(
            @Valid @RequestBody @NonNull BulkCreateTablesRequest request) {
        User currentUser = getCurrentUser();
        List<TableResponse> tables = tableService.bulkCreateTables(getCurrentUserId(currentUser), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tables);
    }

    /**
     * Update table status (STAFF, CASHIER can update)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<TableResponse> updateTableStatus(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull TableStatusRequest request) {
        User currentUser = getCurrentUser();
        String role = currentUser.getAuthorities().iterator().next().getAuthority();
        TableResponse table = tableService.updateTableStatus(id, request, getCurrentUserId(currentUser), role);
        return ResponseEntity.ok(table);
    }

    /**
     * Delete a table (BUSINESS_OWNER only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteTable(@PathVariable @NonNull Long id) {
        User currentUser = getCurrentUser();
        tableService.deleteTable(getCurrentUserId(currentUser), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if user is currently in working hours (STAFF, CASHIER only)
     */
    @GetMapping("/working-hours/check")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER')")
    public ResponseEntity<Map<String, Boolean>> checkWorkingHours() {
        User currentUser = getCurrentUser();
        boolean isInWorkingHours = tableService.isInWorkingHours(getCurrentUserId(currentUser));
        Map<String, Boolean> response = new HashMap<>();
        response.put("isInWorkingHours", isInWorkingHours);
        return ResponseEntity.ok(response);
    }

    @NonNull
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = Objects.requireNonNull(authentication, "authentication must not be null").getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Authenticated principal is not a User");
        }
        return Objects.requireNonNull(user, "authenticated user must not be null");
    }

    @NonNull
    private UUID getCurrentUserId(@NonNull User user) {
        return Objects.requireNonNull(user.getId(), "currentUser.id must not be null");
    }
}
