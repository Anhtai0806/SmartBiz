package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.DashboardStatsResponse;
import com.smartbiz.backend.dto.StoreResponse;
import com.smartbiz.backend.dto.UpdateUserStatusRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.entity.Role;
import com.smartbiz.backend.entity.Status;
import com.smartbiz.backend.entity.Store;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.exception.InvalidRoleException;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * Get all users in the system
     * 
     * @return List of all users
     */
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update user status (Lock/Unlock BUSINESS_OWNER)
     * Only BUSINESS_OWNER accounts can be locked/unlocked
     * 
     * @param userId  User ID to update
     * @param request Status update request
     * @return Updated user response
     */
    @Transactional
    public UserResponse updateUserStatus(UUID userId, UpdateUserStatusRequest request) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate: Only BUSINESS_OWNER can be locked/unlocked
        if (user.getRole() != Role.BUSINESS_OWNER) {
            throw new InvalidRoleException("Only BUSINESS_OWNER accounts can be locked/unlocked");
        }

        // Parse and validate status
        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid status. Must be ACTIVE or INACTIVE");
        }

        // Update status
        user.setStatus(newStatus);
        User updatedUser = userRepository.save(user);

        return convertToUserResponse(updatedUser);
    }

    /**
     * Get all stores with owner information - ADMIN only
     * 
     * @return List of all stores
     */
    public List<StoreResponse> getAllStores() {
        List<Store> stores = storeRepository.findAll();
        return stores.stream()
                .map(this::convertToStoreResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get store by ID with full details - ADMIN only
     * 
     * @param storeId Store ID
     * @return Store response with details
     */
    public StoreResponse getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));
        return convertToStoreResponse(store);
    }

    /**
     * Get dashboard statistics - ADMIN only
     * 
     * @return Dashboard statistics
     */
    public DashboardStatsResponse getDashboardStats() {
        List<User> allUsers = userRepository.findAll();

        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream()
                .filter(user -> user.getStatus() == Status.ACTIVE)
                .count();
        long inactiveUsers = totalUsers - activeUsers;

        // Count users by role
        Map<String, Long> usersByRole = new HashMap<>();
        for (Role role : Role.values()) {
            long count = allUsers.stream()
                    .filter(user -> user.getRole() == role)
                    .count();
            usersByRole.put(role.name(), count);
        }

        long totalStores = storeRepository.count();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalStores(totalStores)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .usersByRole(usersByRole)
                .build();
    }

    /**
     * Delete user - ADMIN only
     * Note: This will cascade delete related data
     * 
     * @param userId User ID to delete
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Prevent deleting ADMIN users
        if (user.getRole() == Role.ADMIN) {
            throw new InvalidRoleException("Cannot delete ADMIN users");
        }

        userRepository.delete(user);
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Convert Store entity to StoreResponse DTO
     */
    private StoreResponse convertToStoreResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .ownerId(store.getOwner().getId())
                .ownerName(store.getOwner().getFullName())
                .ownerEmail(store.getOwner().getEmail())
                .staffCount(store.getStaffMembers() != null ? store.getStaffMembers().size() : 0)
                .tableCount(store.getTables() != null ? store.getTables().size() : 0)
                .createdAt(store.getCreatedAt())
                .build();
    }
}
