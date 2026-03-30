package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.DashboardStatsResponse;
import com.smartbiz.backend.dto.MenuCategoryRequest;
import com.smartbiz.backend.dto.MenuCategoryResponse;
import com.smartbiz.backend.dto.MonthlyRegistrationData;
import com.smartbiz.backend.dto.StoreResponse;
import com.smartbiz.backend.dto.UpdateUserStatusRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.entity.MenuCategory;
import com.smartbiz.backend.entity.Store;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.enums.Role;
import com.smartbiz.backend.enums.Status;
import com.smartbiz.backend.exception.InvalidRoleException;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.MenuCategoryRepository;
import com.smartbiz.backend.repository.MenuItemRepository;
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

        private final UserRepository userRepository;
        private final StoreRepository storeRepository;
        private final MenuCategoryRepository menuCategoryRepository;
        private final MenuItemRepository menuItemRepository;

        /**
         * Get all users in the system
         * 
         * @return List of all users
         */
        public List<UserResponse> getAllUsers() {
                List<User> users = userRepository.findByRole(Role.BUSINESS_OWNER);
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
        public UserResponse updateUserStatus(@NonNull UUID userId, @NonNull UpdateUserStatusRequest request) {
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
        public StoreResponse getStoreById(@NonNull Long storeId) {
                Store store = storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with ID: " + storeId));
                return convertToStoreResponse(requireValue(store, "store"));
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

                // Calculate new business owners this month
                LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0)
                                .withSecond(0);
                long newBusinessOwnersThisMonth = allUsers.stream()
                                .filter(user -> user.getRole() == Role.BUSINESS_OWNER)
                                .filter(user -> user.getCreatedAt().isAfter(startOfMonth))
                                .count();

                // Calculate business owner trend for the past 6 months
                List<MonthlyRegistrationData> businessOwnerTrend = calculateBusinessOwnerTrend(allUsers);

                long totalStores = storeRepository.count();

                return DashboardStatsResponse.builder()
                                .totalUsers(totalUsers)
                                .totalStores(totalStores)
                                .activeUsers(activeUsers)
                                .inactiveUsers(inactiveUsers)
                                .newBusinessOwnersThisMonth(newBusinessOwnersThisMonth)
                                .businessOwnerTrend(businessOwnerTrend)
                                .build();
        }

        /**
         * Delete user - ADMIN only
         * Note: This will cascade delete related data
         * 
         * @param userId User ID to delete
         */
        @Transactional
        public void deleteUser(@NonNull UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                // Prevent deleting ADMIN users
                if (user.getRole() == Role.ADMIN) {
                        throw new InvalidRoleException("Cannot delete ADMIN users");
                }

                userRepository.delete(user);
        }

        /**
         * Get all menu categories across all stores - ADMIN only
         * 
         * @return List of all categories
         */
        public List<MenuCategoryResponse> getAllCategories() {
                List<MenuCategory> categories = menuCategoryRepository.findAll();
                return categories.stream()
                                .map(this::convertToCategoryResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get categories for a specific store - ADMIN only
         * 
         * @param storeId Store ID
         * @return List of categories for the store
         */
        public List<MenuCategoryResponse> getCategoriesByStoreId(@NonNull Long storeId) {
                // Verify store exists
                storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with ID: " + storeId));

                List<MenuCategory> categories = menuCategoryRepository.findByStoreId(storeId);
                return categories.stream()
                                .map(this::convertToCategoryResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Create a new menu category - ADMIN only
         * 
         * @param request Category creation request
         * @return Created category response
         */
        @Transactional
        public MenuCategoryResponse createCategory(@NonNull MenuCategoryRequest request) {
                // Verify store exists
                Long storeId = requireValue(request.getStoreId(), "storeId");
                Store store = storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with ID: " + storeId));

                MenuCategory category = requireValue(MenuCategory.builder()
                                .store(store)
                                .name(request.getName())
                                .build(), "category");

                MenuCategory saved = menuCategoryRepository.save(category);
                return convertToCategoryResponse(saved);
        }

        /**
         * Update a menu category - ADMIN only
         * 
         * @param categoryId Category ID to update
         * @param request    Category update request
         * @return Updated category response
         */
        @Transactional
        public MenuCategoryResponse updateCategory(@NonNull Long categoryId, @NonNull MenuCategoryRequest request) {
                MenuCategory category = menuCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found with ID: " + categoryId));

                // Update category name
                category.setName(request.getName());

                // If store is being changed, verify new store exists
                Long storeId = requireValue(request.getStoreId(), "storeId");
                if (!category.getStore().getId().equals(storeId)) {
                        Store newStore = storeRepository.findById(storeId)
                                        .orElseThrow(
                                                        () -> new ResourceNotFoundException("Store not found with ID: "
                                                                        + storeId));
                        category.setStore(newStore);
                }

                MenuCategory updated = menuCategoryRepository.save(category);
                return convertToCategoryResponse(requireValue(updated, "updatedCategory"));
        }

        /**
         * Delete a menu category - ADMIN only
         * Note: This will cascade delete all menu items in the category
         * 
         * @param categoryId Category ID to delete
         */
        @Transactional
        public void deleteCategory(@NonNull Long categoryId) {
                MenuCategory category = menuCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found with ID: " + categoryId));

                menuCategoryRepository.delete(requireValue(category, "category"));
        }

        /**
         * Convert User entity to UserResponse DTO
         */
        private UserResponse convertToUserResponse(@NonNull User user) {
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
        private StoreResponse convertToStoreResponse(@NonNull Store store) {
                return StoreResponse.builder()
                                .id(store.getId())
                                .name(store.getName())
                                .address(store.getAddress())
                                .phone(store.getPhone())
                                .taxRate(store.getTaxRate())
                                .openingTime(store.getOpeningTime())
                                .closingTime(store.getClosingTime())
                                .ownerId(store.getOwner().getId())
                                .ownerName(store.getOwner().getFullName())
                                .ownerEmail(store.getOwner().getEmail())
                                .status(Boolean.TRUE.equals(store.getStatus()))
                                .staffCount(store.getStaffMembers() != null ? store.getStaffMembers().size() : 0)
                                .tableCount(store.getTables() != null ? store.getTables().size() : 0)
                                .createdAt(store.getCreatedAt())
                                .build();
        }

        /**
         * Convert MenuCategory entity to MenuCategoryResponse DTO
         */
        private MenuCategoryResponse convertToCategoryResponse(@NonNull MenuCategory category) {
                Long categoryId = requireValue(category.getId(), "categoryId");
                return MenuCategoryResponse.builder()
                                .id(categoryId)
                                .storeId(category.getStore().getId())
                                .storeName(category.getStore().getName())
                                .name(category.getName())
                                .itemCount(menuItemRepository.countByCategoryId(categoryId))
                                .build();
        }

        /**
         * Calculate business owner registration trend for the past 6 months
         * 
         * @param allUsers List of all users
         * @return List of monthly registration data
         */
        private List<MonthlyRegistrationData> calculateBusinessOwnerTrend(List<User> allUsers) {
                List<MonthlyRegistrationData> trend = new ArrayList<>();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

                // Get business owners only
                List<User> businessOwners = allUsers.stream()
                                .filter(user -> user.getRole() == Role.BUSINESS_OWNER)
                                .collect(Collectors.toList());

                // Calculate for the past 6 months
                for (int i = 5; i >= 0; i--) {
                        LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0)
                                        .withMinute(0)
                                        .withSecond(0);
                        LocalDateTime monthEnd = monthStart.plusMonths(1);

                        long count = businessOwners.stream()
                                        .filter(user -> user.getCreatedAt().isAfter(monthStart)
                                                        && user.getCreatedAt().isBefore(monthEnd))
                                        .count();

                        String monthLabel = monthStart.format(formatter);
                        trend.add(MonthlyRegistrationData.builder()
                                        .month(monthLabel)
                                        .count(count)
                                        .build());
                }

                return trend;
        }

        /**
         * Get all stores owned by a specific business owner - ADMIN only
         * 
         * @param ownerId Business owner user ID
         * @return List of stores owned by the business owner
         */
        public List<StoreResponse> getStoresByOwnerId(@NonNull UUID ownerId) {
                // Verify user exists and is a business owner
                User owner = userRepository.findById(ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + ownerId));

                if (owner.getRole() != Role.BUSINESS_OWNER) {
                        throw new InvalidRoleException("User is not a business owner");
                }

                // Get all stores owned by this user
                List<Store> stores = storeRepository.findByOwnerId(ownerId);
                return stores.stream()
                                .map(this::convertToStoreResponse)
                                .collect(Collectors.toList());
        }

        @NonNull
        private <T> T requireValue(T value, String fieldName) {
                return Objects.requireNonNull(value, fieldName + " must not be null");
        }
}
