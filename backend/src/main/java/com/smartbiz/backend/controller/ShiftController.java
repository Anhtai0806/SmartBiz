package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Shift Management endpoints
 */
@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    /**
     * Get shifts by store (BUSINESS_OWNER)
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<ShiftResponse>> getShiftsByStore(@PathVariable Long storeId) {
        List<ShiftResponse> shifts = shiftService.getShiftsByStore(storeId);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Get my shifts (current user)
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER', 'KITCHEN')")
    public ResponseEntity<List<ShiftResponse>> getMyShifts() {
        User currentUser = getCurrentUser();
        List<ShiftResponse> shifts = shiftService.getMyShifts(currentUser.getId());
        return ResponseEntity.ok(shifts);
    }

    /**
     * Create a new shift (BUSINESS_OWNER only)
     */
    @PostMapping("/store/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ShiftResponse> createShift(
            @PathVariable Long storeId,
            @Valid @RequestBody ShiftRequest request) {
        User currentUser = getCurrentUser();
        ShiftResponse shift = shiftService.createShift(currentUser.getId(), storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(shift);
    }

    /**
     * Update a shift (BUSINESS_OWNER only)
     */
    @PutMapping("/store/{storeId}/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ShiftResponse> updateShift(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody ShiftRequest request) {
        User currentUser = getCurrentUser();
        ShiftResponse shift = shiftService.updateShift(currentUser.getId(), storeId, id, request);
        return ResponseEntity.ok(shift);
    }

    /**
     * Delete a shift (BUSINESS_OWNER only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        shiftService.deleteShift(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get shifts by date range for calendar view (BUSINESS_OWNER)
     */
    @GetMapping("/store/{storeId}/calendar")
    @PreAuthorize("hasAnyRole('BUSINESS_OWNER', 'CASHIER', 'STAFF', 'KITCHEN')")
    public ResponseEntity<List<ShiftResponse>> getShiftsByDateRange(
            @PathVariable Long storeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        User currentUser = getCurrentUser();
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        List<ShiftResponse> shifts = shiftService.getShiftsByStoreAndDateRange(
                currentUser.getId(), storeId, start, end);
        return ResponseEntity.ok(shifts);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}
