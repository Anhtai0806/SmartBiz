package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.DashboardStatsResponse;
import com.smartbiz.backend.dto.StoreResponse;
import com.smartbiz.backend.dto.UpdateUserStatusRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin-only endpoints
 * Only users with ADMIN role can access these endpoints
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Get all users - ADMIN only
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Lock/Unlock BUSINESS_OWNER account - ADMIN only
     * 
     * @param userId  User ID to update
     * @param request Status update request (ACTIVE or INACTIVE)
     * @return Updated user response
     */
    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserResponse updatedUser = adminService.updateUserStatus(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Admin dashboard - ADMIN only
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getAdminDashboard() {
        return ResponseEntity.ok("Welcome to Admin Dashboard");
    }

    /**
     * Get dashboard statistics - ADMIN only
     * 
     * @return Dashboard statistics including user counts and store counts
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all stores - ADMIN only
     * 
     * @return List of all stores with owner information
     */
    @GetMapping("/stores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StoreResponse>> getAllStores() {
        List<StoreResponse> stores = adminService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    /**
     * Get store by ID - ADMIN only
     * 
     * @param storeId Store ID
     * @return Store details with owner and counts
     */
    @GetMapping("/stores/{storeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StoreResponse> getStoreById(@PathVariable Long storeId) {
        StoreResponse store = adminService.getStoreById(storeId);
        return ResponseEntity.ok(store);
    }

    /**
     * Delete user - ADMIN only
     * Note: Cannot delete ADMIN users
     * 
     * @param userId User ID to delete
     * @return Success message
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
