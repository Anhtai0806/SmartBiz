package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.BusinessOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Business Owner endpoints
 * Accessible by BUSINESS_OWNER role
 */
@RestController
@RequestMapping("/business")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessOwnerService businessOwnerService;

    /**
     * Get stores owned by current user
     */
    @GetMapping("/stores")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<StoreResponse>> getMyStores() {
        User currentUser = getCurrentUser();
        List<StoreResponse> stores = businessOwnerService.getMyStores(currentUser.getId());
        return ResponseEntity.ok(stores);
    }

    /**
     * Create a new store
     */
    @PostMapping("/stores")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody CreateStoreRequest request) {
        User currentUser = getCurrentUser();
        StoreResponse store = businessOwnerService.createStore(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(store);
    }

    /**
     * Create STAFF or CASHIER account
     */
    @PostMapping("/staff")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        User currentUser = getCurrentUser();
        UserResponse staff = businessOwnerService.createStaff(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    /**
     * Assign staff to a store
     */
    @PostMapping("/staff/assign")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> assignStaffToStore(@Valid @RequestBody AssignStaffRequest request) {
        User currentUser = getCurrentUser();
        StoreResponse store = businessOwnerService.assignStaffToStore(currentUser.getId(), request);
        return ResponseEntity.ok(store);
    }

    /**
     * Update staff status (ACTIVE/INACTIVE)
     */
    @PutMapping("/staff/{staffId}/status")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> updateStaffStatus(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        User currentUser = getCurrentUser();
        UserResponse staff = businessOwnerService.updateStaffStatus(currentUser.getId(), staffId, request);
        return ResponseEntity.ok(staff);
    }

    /**
     * Business dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<String> getBusinessDashboard() {
        return ResponseEntity.ok("Welcome to Business Dashboard");
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}
