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
     * Update store information
     */
    @PutMapping("/stores/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long storeId,
            @Valid @RequestBody UpdateStoreRequest request) {
        User currentUser = getCurrentUser();
        StoreResponse store = businessOwnerService.updateStore(currentUser.getId(), storeId, request);
        return ResponseEntity.ok(store);
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
     * Update staff details
     */
    @PutMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<UserResponse> updateStaff(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateStaffRequest request) {
        User currentUser = getCurrentUser();
        UserResponse staff = businessOwnerService.updateStaff(currentUser.getId(), staffId, request);
        return ResponseEntity.ok(staff);
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<DashboardStatsResponse> getDashboard() {
        User currentUser = getCurrentUser();
        DashboardStatsResponse stats = businessOwnerService.getDashboardStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Get store details with staff and menu items
     */
    @GetMapping("/stores/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<StoreDetailResponse> getStoreDetails(@PathVariable Long storeId) {
        User currentUser = getCurrentUser();
        StoreDetailResponse store = businessOwnerService.getStoreDetails(currentUser.getId(), storeId);
        return ResponseEntity.ok(store);
    }

    /**
     * Get staff for a specific store
     */
    @GetMapping("/stores/{storeId}/staff")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<UserResponse>> getStoreStaff(@PathVariable Long storeId) {
        User currentUser = getCurrentUser();
        List<UserResponse> staff = businessOwnerService.getStoreStaff(currentUser.getId(), storeId);
        return ResponseEntity.ok(staff);
    }

    /**
     * Remove staff from a store
     */
    @DeleteMapping("/stores/{storeId}/staff/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> removeStaffFromStore(
            @PathVariable Long storeId,
            @PathVariable UUID staffId) {
        User currentUser = getCurrentUser();
        businessOwnerService.removeStaffFromStore(currentUser.getId(), storeId, staffId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Create menu item for a store
     */
    @PostMapping("/stores/{storeId}/menu-items")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @PathVariable Long storeId,
            @Valid @RequestBody MenuItemRequest request) {
        User currentUser = getCurrentUser();
        MenuItemResponse menuItem = businessOwnerService.createMenuItem(currentUser.getId(), storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItem);
    }

    /**
     * Update menu item
     */
    @PutMapping("/menu-items/{itemId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long itemId,
            @Valid @RequestBody MenuItemRequest request) {
        User currentUser = getCurrentUser();
        MenuItemResponse menuItem = businessOwnerService.updateMenuItem(currentUser.getId(), itemId, request);
        return ResponseEntity.ok(menuItem);
    }

    /**
     * Delete menu item
     */
    @DeleteMapping("/menu-items/{itemId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId) {
        User currentUser = getCurrentUser();
        businessOwnerService.deleteMenuItem(currentUser.getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all categories for current business owner
     */
    @GetMapping("/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<MenuCategoryResponse>> getAllCategories() {
        User currentUser = getCurrentUser();
        List<MenuCategoryResponse> categories = businessOwnerService.getAllCategories(currentUser.getId());
        return ResponseEntity.ok(categories);
    }

    /**
     * Create category for a store
     */
    @PostMapping("/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> createCategory(@Valid @RequestBody MenuCategoryRequest request) {
        User currentUser = getCurrentUser();
        MenuCategoryResponse category = businessOwnerService.createCategory(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * Update category
     */
    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody MenuCategoryRequest request) {
        User currentUser = getCurrentUser();
        MenuCategoryResponse category = businessOwnerService.updateCategory(currentUser.getId(), categoryId, request);
        return ResponseEntity.ok(category);
    }

    /**
     * Delete category
     * Note: This will cascade delete all menu items in the category
     */
    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        User currentUser = getCurrentUser();
        businessOwnerService.deleteCategory(currentUser.getId(), categoryId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get categories for a store
     */
    @GetMapping("/stores/{storeId}/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<MenuCategoryResponse>> getStoreCategories(@PathVariable Long storeId) {
        User currentUser = getCurrentUser();
        List<MenuCategoryResponse> categories = businessOwnerService.getStoreCategories(currentUser.getId(), storeId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get shift templates for a store
     */
    @GetMapping("/stores/{storeId}/shift-templates")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<WorkShiftResponse>> getShiftTemplates(@PathVariable Long storeId) {
        User currentUser = getCurrentUser();
        List<WorkShiftResponse> templates = businessOwnerService.getShiftTemplates(currentUser.getId(), storeId);
        return ResponseEntity.ok(templates);
    }

    /**
     * Create shift template for a store
     */
    @PostMapping("/stores/{storeId}/shift-templates")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<WorkShiftResponse> createShiftTemplate(
            @PathVariable Long storeId,
            @Valid @RequestBody WorkShiftRequest request) {
        User currentUser = getCurrentUser();
        // Ensure storeId in path matches request
        request.setStoreId(storeId);
        WorkShiftResponse template = businessOwnerService.createShiftTemplate(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    /**
     * Update shift template
     */
    @PutMapping("/shift-templates/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<WorkShiftResponse> updateShiftTemplate(
            @PathVariable Long shiftId,
            @Valid @RequestBody WorkShiftRequest request) {
        User currentUser = getCurrentUser();
        WorkShiftResponse template = businessOwnerService.updateShiftTemplate(currentUser.getId(), shiftId, request);
        return ResponseEntity.ok(template);
    }

    /**
     * Delete shift template
     */
    @DeleteMapping("/shift-templates/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteShiftTemplate(@PathVariable Long shiftId) {
        User currentUser = getCurrentUser();
        businessOwnerService.deleteShiftTemplate(currentUser.getId(), shiftId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get QR payment code for current business owner
     */
    @GetMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<QRPaymentResponse> getQRPaymentCode() {
        User currentUser = getCurrentUser();
        QRPaymentResponse qrCode = businessOwnerService.getQRPaymentCode(currentUser.getId());
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
    public ResponseEntity<QRPaymentResponse> createQRPaymentCode(@Valid @RequestBody QRPaymentRequest request) {
        User currentUser = getCurrentUser();
        QRPaymentResponse qrCode = businessOwnerService.createQRPaymentCode(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(qrCode);
    }

    /**
     * Update QR payment code
     */
    @PutMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<QRPaymentResponse> updateQRPaymentCode(@Valid @RequestBody QRPaymentRequest request) {
        User currentUser = getCurrentUser();
        QRPaymentResponse qrCode = businessOwnerService.updateQRPaymentCode(currentUser.getId(), request);
        return ResponseEntity.ok(qrCode);
    }

    /**
     * Delete QR payment code
     */
    @DeleteMapping("/qr-payment")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteQRPaymentCode() {
        User currentUser = getCurrentUser();
        businessOwnerService.deleteQRPaymentCode(currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}
