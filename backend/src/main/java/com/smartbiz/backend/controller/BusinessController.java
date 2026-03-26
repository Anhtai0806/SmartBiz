package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.dto.MenuCategoryRequest;
import com.smartbiz.backend.dto.MenuCategoryResponse;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.BusinessOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
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
        UUID currentUserId = getCurrentUserId();
        List<StoreResponse> stores = businessOwnerService.getMyStores(currentUserId);
        return ResponseEntity.ok(stores);
    }

    /**
     * Create a new store
     */
    @PostMapping("/stores")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody @NonNull CreateStoreRequest request) {
        UUID currentUserId = getCurrentUserId();
        StoreResponse store = businessOwnerService.createStore(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(store);
    }

    /**
     * Update store information
     */
    @PutMapping("/stores/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable @NonNull Long storeId,
            @Valid @RequestBody @NonNull UpdateStoreRequest request) {
        UUID currentUserId = getCurrentUserId();
        StoreResponse store = businessOwnerService.updateStore(currentUserId, storeId, request);
        return ResponseEntity.ok(store);
    }

    /**
     * Create STAFF or CASHIER account
     */
    @PostMapping("/staff")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody @NonNull CreateStaffRequest request) {
        UUID currentUserId = getCurrentUserId();
        UserResponse staff = businessOwnerService.createStaff(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    /**
     * Assign staff to a store
     */
    @PostMapping("/staff/assign")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> assignStaffToStore(@Valid @RequestBody @NonNull AssignStaffRequest request) {
        UUID currentUserId = getCurrentUserId();
        StoreResponse store = businessOwnerService.assignStaffToStore(currentUserId, request);
        return ResponseEntity.ok(store);
    }

    /**
     * Update staff status (ACTIVE/INACTIVE)
     */
    @PutMapping("/staff/{staffId}/status")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> updateStaffStatus(
            @PathVariable @NonNull UUID staffId,
            @Valid @RequestBody @NonNull UpdateUserStatusRequest request) {
        UUID currentUserId = getCurrentUserId();
        UserResponse staff = businessOwnerService.updateStaffStatus(currentUserId, staffId, request);
        return ResponseEntity.ok(staff);
    }

    /**
     * Update staff details
     */
    @PutMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> updateStaff(
            @PathVariable @NonNull UUID staffId,
            @Valid @RequestBody @NonNull UpdateStaffRequest request) {
        UUID currentUserId = getCurrentUserId();
        UserResponse staff = businessOwnerService.updateStaff(currentUserId, staffId, request);
        return ResponseEntity.ok(staff);
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<DashboardStatsResponse> getDashboard() {
        UUID currentUserId = getCurrentUserId();
        DashboardStatsResponse stats = businessOwnerService.getDashboardStats(currentUserId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get store details with staff and menu items
     */
    @GetMapping("/stores/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreDetailResponse> getStoreDetails(@PathVariable @NonNull Long storeId) {
        UUID currentUserId = getCurrentUserId();
        StoreDetailResponse store = businessOwnerService.getStoreDetails(currentUserId, storeId);
        return ResponseEntity.ok(store);
    }

    /**
     * Get staff for a specific store
     */
    @GetMapping("/stores/{storeId}/staff")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<UserResponse>> getStoreStaff(@PathVariable @NonNull Long storeId) {
        UUID currentUserId = getCurrentUserId();
        List<UserResponse> staff = businessOwnerService.getStoreStaff(currentUserId, storeId);
        return ResponseEntity.ok(staff);
    }

    /**
     * Remove staff from a store
     */
    @DeleteMapping("/stores/{storeId}/staff/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> removeStaffFromStore(
            @PathVariable @NonNull Long storeId,
            @PathVariable @NonNull UUID staffId) {
        UUID currentUserId = getCurrentUserId();
        businessOwnerService.removeStaffFromStore(currentUserId, storeId, staffId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Create menu item for a store
     */
    @PostMapping("/stores/{storeId}/menu-items")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @PathVariable @NonNull Long storeId,
            @Valid @RequestBody @NonNull MenuItemRequest request) {
        UUID currentUserId = getCurrentUserId();
        MenuItemResponse menuItem = businessOwnerService.createMenuItem(currentUserId, storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItem);
    }

    /**
     * Update menu item
     */
    @PutMapping("/menu-items/{itemId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable @NonNull Long itemId,
            @Valid @RequestBody @NonNull MenuItemRequest request) {
        UUID currentUserId = getCurrentUserId();
        MenuItemResponse menuItem = businessOwnerService.updateMenuItem(currentUserId, itemId, request);
        return ResponseEntity.ok(menuItem);
    }

    /**
     * Delete menu item
     */
    @DeleteMapping("/menu-items/{itemId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable @NonNull Long itemId) {
        UUID currentUserId = getCurrentUserId();
        businessOwnerService.deleteMenuItem(currentUserId, itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all categories for current business owner
     */
    @GetMapping("/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<MenuCategoryResponse>> getAllCategories() {
        UUID currentUserId = getCurrentUserId();
        List<MenuCategoryResponse> categories = businessOwnerService.getAllCategories(currentUserId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Create category for a store
     */
    @PostMapping("/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> createCategory(@Valid @RequestBody @NonNull MenuCategoryRequest request) {
        UUID currentUserId = getCurrentUserId();
        MenuCategoryResponse category = businessOwnerService.createCategory(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * Update category
     */
    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> updateCategory(
            @PathVariable @NonNull Long categoryId,
            @Valid @RequestBody @NonNull MenuCategoryRequest request) {
        UUID currentUserId = getCurrentUserId();
        MenuCategoryResponse category = businessOwnerService.updateCategory(currentUserId, categoryId, request);
        return ResponseEntity.ok(category);
    }

    /**
     * Delete category
     * Note: This will cascade delete all menu items in the category
     */
    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable @NonNull Long categoryId) {
        UUID currentUserId = getCurrentUserId();
        businessOwnerService.deleteCategory(currentUserId, categoryId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get categories for a store
     */
    @GetMapping("/stores/{storeId}/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<MenuCategoryResponse>> getStoreCategories(@PathVariable @NonNull Long storeId) {
        UUID currentUserId = getCurrentUserId();
        List<MenuCategoryResponse> categories = businessOwnerService.getStoreCategories(currentUserId, storeId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get shift templates for a store
     */
    @GetMapping("/stores/{storeId}/shift-templates")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<WorkShiftResponse>> getShiftTemplates(@PathVariable @NonNull Long storeId) {
        UUID currentUserId = getCurrentUserId();
        List<WorkShiftResponse> templates = businessOwnerService.getShiftTemplates(currentUserId, storeId);
        return ResponseEntity.ok(templates);
    }

    /**
     * Create shift template for a store
     */
    @PostMapping("/stores/{storeId}/shift-templates")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<WorkShiftResponse> createShiftTemplate(
            @PathVariable @NonNull Long storeId,
            @Valid @RequestBody @NonNull WorkShiftRequest request) {
        UUID currentUserId = getCurrentUserId();
        // Ensure storeId in path matches request
        request.setStoreId(storeId);
        WorkShiftResponse template = businessOwnerService.createShiftTemplate(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    /**
     * Update shift template
     */
    @PutMapping("/shift-templates/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<WorkShiftResponse> updateShiftTemplate(
            @PathVariable @NonNull Long shiftId,
            @Valid @RequestBody @NonNull WorkShiftRequest request) {
        UUID currentUserId = getCurrentUserId();
        WorkShiftResponse template = businessOwnerService.updateShiftTemplate(currentUserId, shiftId, request);
        return ResponseEntity.ok(template);
    }

    /**
     * Delete shift template
     */
    @DeleteMapping("/shift-templates/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteShiftTemplate(@PathVariable @NonNull Long shiftId) {
        UUID currentUserId = getCurrentUserId();
        businessOwnerService.deleteShiftTemplate(currentUserId, shiftId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get QR payment code for current business owner
     */
    @GetMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<QRPaymentResponse> getQRPaymentCode() {
        UUID currentUserId = getCurrentUserId();
        QRPaymentResponse qrCode = businessOwnerService.getQRPaymentCode(currentUserId);
        if (qrCode == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(qrCode);
    }

    /**
     * Create QR payment code
     */
    @PostMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<QRPaymentResponse> createQRPaymentCode(@Valid @RequestBody @NonNull QRPaymentRequest request) {
        UUID currentUserId = getCurrentUserId();
        QRPaymentResponse qrCode = businessOwnerService.createQRPaymentCode(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(qrCode);
    }

    /**
     * Update QR payment code
     */
    @PutMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<QRPaymentResponse> updateQRPaymentCode(@Valid @RequestBody @NonNull QRPaymentRequest request) {
        UUID currentUserId = getCurrentUserId();
        QRPaymentResponse qrCode = businessOwnerService.updateQRPaymentCode(currentUserId, request);
        return ResponseEntity.ok(qrCode);
    }

    /**
     * Delete QR payment code
     */
    @DeleteMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteQRPaymentCode() {
        UUID currentUserId = getCurrentUserId();
        businessOwnerService.deleteQRPaymentCode(currentUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get current authenticated user
     */
    private @NonNull User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Objects.requireNonNull(authentication, "Authentication must not be null");
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Authenticated principal must be a User");
        }
        return user;
    }

    private @NonNull UUID getCurrentUserId() {
        return requireValue(getCurrentUser().getId(), "currentUser.id");
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
