package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.Role;
import com.smartbiz.backend.enums.Status;
import com.smartbiz.backend.exception.EmailOrPhoneAlreadyExistsException;
import com.smartbiz.backend.exception.InvalidRoleException;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.MenuCategoryRepository;
import com.smartbiz.backend.repository.MenuItemRepository;
import com.smartbiz.backend.repository.QRPaymentCodeRepository;
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessOwnerService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final WorkShiftRepository workShiftRepository;
    private final QRPaymentCodeRepository qrPaymentCodeRepository;

    /**
     * Create a new store for the business owner
     * 
     * @param ownerId Owner's user ID
     * @param request Store creation request
     * @return Created store response
     */
    @Transactional
    public StoreResponse createStore(UUID ownerId, CreateStoreRequest request) {
        // Find owner
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // Validate owner role
        if (owner.getRole() != Role.BUSINESS_OWNER) {
            throw new InvalidRoleException("Only BUSINESS_OWNER can create stores");
        }

        // Create store
        Store store = Store.builder()
                .owner(owner)
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .taxRate(request.getTaxRate())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .build();

        Store savedStore = storeRepository.save(store);

        return convertToStoreResponse(savedStore);
    }

    /**
     * Update store information (name, address, status)
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @param request Update store request
     * @return Updated store response
     */
    @Transactional
    public StoreResponse updateStore(UUID ownerId, Long storeId, UpdateStoreRequest request) {
        // Find store
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only update your own stores");
        }

        // Update fields
        store.setName(request.getName());
        store.setAddress(request.getAddress());
        store.setPhone(request.getPhone());
        store.setTaxRate(request.getTaxRate());
        store.setOpeningTime(request.getOpeningTime());
        store.setClosingTime(request.getClosingTime());

        // Update status if provided
        if (request.getStatus() != null) {
            Status newStatus;
            try {
                newStatus = Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidRoleException("Invalid status. Must be ACTIVE or INACTIVE");
            }
            store.setStatus(newStatus);
        }

        Store updatedStore = storeRepository.save(store);
        return convertToStoreResponse(updatedStore);
    }

    /**
     * Create STAFF or CASHIER account
     * Only BUSINESS_OWNER can create staff accounts
     * 
     * @param ownerId Owner's user ID
     * @param request Staff creation request
     * @return Created user response
     */
    @Transactional
    public UserResponse createStaff(UUID ownerId, CreateStaffRequest request) {
        // Verify owner exists and has correct role
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        if (owner.getRole() != Role.BUSINESS_OWNER) {
            throw new InvalidRoleException("Only BUSINESS_OWNER can create staff accounts");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailOrPhoneAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Validate role - only STAFF, CASHIER, or KITCHEN allowed
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid role: " + request.getRole());
        }

        if (role != Role.STAFF && role != Role.CASHIER && role != Role.KITCHEN) {
            throw new InvalidRoleException(
                    "Only STAFF, CASHIER, or KITCHEN roles can be created. Cannot create: " + role);
        }

        // Create staff user
        User staff = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(Status.ACTIVE)
                .salaryType(request.getSalaryType())
                .salaryAmount(request.getSalaryAmount())
                .build();

        User savedStaff = userRepository.save(staff);

        return convertToUserResponse(savedStaff);
    }

    /**
     * Assign staff to a store
     * Verifies that the owner owns the store
     * 
     * @param ownerId Owner's user ID
     * @param request Assignment request
     * @return Updated store response
     */
    @Transactional
    public StoreResponse assignStaffToStore(UUID ownerId, AssignStaffRequest request) {
        // Verify owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // Verify store exists and belongs to owner
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + request.getStoreId()));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only assign staff to your own stores");
        }

        // Verify staff user exists
        User staff = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with ID: " + request.getUserId()));

        // Validate staff role
        if (staff.getRole() != Role.STAFF && staff.getRole() != Role.CASHIER && staff.getRole() != Role.KITCHEN) {
            throw new InvalidRoleException("Only STAFF, CASHIER, or KITCHEN can be assigned to stores");
        }

        // Add staff to store if not already assigned
        if (!store.getStaffMembers().contains(staff)) {
            store.getStaffMembers().add(staff);
            storeRepository.save(store);
        }

        return convertToStoreResponse(store);
    }

    /**
     * Update staff status (ACTIVE/INACTIVE)
     * Only owner can update staff status for their stores
     * 
     * @param ownerId Owner's user ID
     * @param staffId Staff user ID
     * @param request Status update request
     * @return Updated user response
     */
    @Transactional
    public UserResponse updateStaffStatus(UUID ownerId, UUID staffId, UpdateUserStatusRequest request) {
        // Verify owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // Verify staff exists
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with ID: " + staffId));

        // Validate staff role
        if (staff.getRole() != Role.STAFF && staff.getRole() != Role.CASHIER && staff.getRole() != Role.KITCHEN) {
            throw new InvalidRoleException("Can only update status for STAFF, CASHIER, or KITCHEN");
        }

        // Verify staff belongs to one of owner's stores
        List<Store> ownerStores = storeRepository.findByOwnerId(ownerId);
        boolean staffBelongsToOwner = ownerStores.stream()
                .anyMatch(store -> store.getStaffMembers().contains(staff));

        if (!staffBelongsToOwner) {
            throw new UnauthorizedException("You can only update status for staff in your stores");
        }

        // Parse and validate status
        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid status. Must be ACTIVE or INACTIVE");
        }

        // Update status
        staff.setStatus(newStatus);
        User updatedStaff = userRepository.save(staff);

        return convertToUserResponse(updatedStaff);
    }

    /**
     * Update staff information
     * Only owner can update staff for their stores
     *
     * @param ownerId Owner's user ID
     * @param staffId Staff user ID
     * @param request Update staff request
     * @return Updated user response
     */
    @Transactional
    public UserResponse updateStaff(UUID ownerId, UUID staffId, UpdateStaffRequest request) {
        // Verify owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // Verify staff exists
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with ID: " + staffId));

        // Validate staff role
        if (staff.getRole() != Role.STAFF && staff.getRole() != Role.CASHIER && staff.getRole() != Role.KITCHEN) {
            throw new InvalidRoleException("Can only update STAFF, CASHIER, or KITCHEN");
        }

        // Verify staff belongs to one of owner's stores
        List<Store> ownerStores = storeRepository.findByOwnerId(ownerId);
        boolean staffBelongsToOwner = ownerStores.stream()
                .anyMatch(store -> store.getStaffMembers().contains(staff));

        if (!staffBelongsToOwner) {
            throw new UnauthorizedException("You can only update staff in your stores");
        }

        // Update fields if provided
        if (request.getFullName() != null)
            staff.setFullName(request.getFullName());
        if (request.getEmail() != null) {
            // Check if email changed and is unique
            if (!staff.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new EmailOrPhoneAlreadyExistsException("Email already exists: " + request.getEmail());
            }
            staff.setEmail(request.getEmail());
        }
        if (request.getPhone() != null)
            staff.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getSalaryType() != null)
            staff.setSalaryType(request.getSalaryType());
        if (request.getSalaryAmount() != null)
            staff.setSalaryAmount(request.getSalaryAmount());

        User updatedStaff = userRepository.save(staff);
        return convertToUserResponse(updatedStaff);
    }

    /**
     * Get all stores owned by the business owner
     * 
     * @param ownerId Owner's user ID
     * @return List of store responses
     */
    public List<StoreResponse> getMyStores(UUID ownerId) {
        List<Store> stores = storeRepository.findByOwnerId(ownerId);
        return stores.stream()
                .map(this::convertToStoreResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard statistics for business owner
     * 
     * @param ownerId Owner's user ID
     * @return Dashboard stats
     */
    public DashboardStatsResponse getDashboardStats(UUID ownerId) {
        List<Store> stores = storeRepository.findByOwnerId(ownerId);

        long totalStores = stores.size();
        long totalStaff = stores.stream()
                .mapToLong(store -> store.getStaffMembers().size())
                .sum();
        long totalMenuItems = stores.stream()
                .flatMap(store -> store.getMenuCategories().stream())
                .mapToLong(category -> category.getMenuItems().size())
                .sum();

        return DashboardStatsResponse.builder()
                .totalStores(totalStores)
                .totalUsers(totalStaff) // Reusing this field for staff count
                .activeUsers(totalMenuItems) // Reusing this field for menu items count
                .build();
    }

    /**
     * Get store details with staff and menu items
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @return Store detail response
     */
    public StoreDetailResponse getStoreDetails(UUID ownerId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only view your own stores");
        }

        // Convert staff members
        List<UserResponse> staffResponses = store.getStaffMembers().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        // Convert menu items
        List<MenuItemResponse> menuItemResponses = store.getMenuCategories().stream()
                .flatMap(category -> category.getMenuItems().stream()
                        .map(item -> convertToMenuItemResponse(item, category.getName())))
                .collect(Collectors.toList());

        // Convert tables
        List<TableResponse> tableResponses = store.getTables().stream()
                .map(this::convertToTableResponse)
                .collect(Collectors.toList());

        return StoreDetailResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .phone(store.getPhone())
                .taxRate(store.getTaxRate())
                .openingTime(store.getOpeningTime())
                .closingTime(store.getClosingTime())
                .ownerId(store.getOwner().getId())
                .ownerName(store.getOwner().getFullName())
                .status(store.getStatus() != null ? store.getStatus().name() : "ACTIVE")
                .staffMembers(staffResponses)
                .menuItems(menuItemResponses)
                .tables(tableResponses)
                .createdAt(store.getCreatedAt())
                .build();
    }

    /**
     * Get staff members for a specific store
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @return List of staff members
     */
    public List<UserResponse> getStoreStaff(UUID ownerId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only view staff for your own stores");
        }

        return store.getStaffMembers().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Remove staff from a store
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @param staffId Staff user ID
     */
    @Transactional
    public void removeStaffFromStore(UUID ownerId, Long storeId, UUID staffId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only remove staff from your own stores");
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with ID: " + staffId));

        store.getStaffMembers().remove(staff);
        storeRepository.save(store);
    }

    /**
     * Create menu item for a store
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @param request Menu item request
     * @return Created menu item response
     */
    @Transactional
    public MenuItemResponse createMenuItem(UUID ownerId, Long storeId, MenuItemRequest request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only add menu items to your own stores");
        }

        MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        // Verify category belongs to this store
        if (!category.getStore().getId().equals(storeId)) {
            throw new InvalidRoleException("Category does not belong to this store");
        }

        MenuItem menuItem = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .price(request.getPrice())
                .status(request.getStatus())
                .build();

        MenuItem savedItem = menuItemRepository.save(menuItem);
        return convertToMenuItemResponse(savedItem, category.getName());
    }

    /**
     * Update menu item
     * 
     * @param ownerId Owner's user ID
     * @param itemId  Menu item ID
     * @param request Menu item request
     * @return Updated menu item response
     */
    @Transactional
    public MenuItemResponse updateMenuItem(UUID ownerId, Long itemId, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemId));

        // Verify ownership through store
        if (!menuItem.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only update menu items in your own stores");
        }

        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());
        menuItem.setStatus(request.getStatus());

        MenuItem updatedItem = menuItemRepository.save(menuItem);
        return convertToMenuItemResponse(updatedItem, menuItem.getCategory().getName());
    }

    /**
     * Delete menu item
     * 
     * @param ownerId Owner's user ID
     * @param itemId  Menu item ID
     */
    @Transactional
    public void deleteMenuItem(UUID ownerId, Long itemId) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemId));

        if (!menuItem.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only delete menu items from your own stores");
        }

        menuItemRepository.delete(menuItem);
    }

    /**
     * Get all categories for all stores owned by the business owner
     * 
     * @param ownerId Owner's user ID
     * @return List of all categories across owner's stores
     */
    public List<MenuCategoryResponse> getAllCategories(UUID ownerId) {
        List<Store> stores = storeRepository.findByOwnerId(ownerId);
        return stores.stream()
                .flatMap(store -> menuCategoryRepository.findByStoreId(store.getId()).stream())
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create category for a store
     * 
     * @param ownerId Owner's user ID
     * @param request Category creation request
     * @return Created category response
     */
    @Transactional
    public MenuCategoryResponse createCategory(UUID ownerId, MenuCategoryRequest request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only create categories for your own stores");
        }

        MenuCategory category = MenuCategory.builder()
                .store(store)
                .name(request.getName())
                .build();

        MenuCategory savedCategory = menuCategoryRepository.save(category);
        return convertToCategoryResponse(savedCategory);
    }

    /**
     * Update category
     * 
     * @param ownerId    Owner's user ID
     * @param categoryId Category ID
     * @param request    Category update request
     * @return Updated category response
     */
    @Transactional
    public MenuCategoryResponse updateCategory(UUID ownerId, Long categoryId, MenuCategoryRequest request) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only update categories in your own stores");
        }

        category.setName(request.getName());
        MenuCategory updatedCategory = menuCategoryRepository.save(category);
        return convertToCategoryResponse(updatedCategory);
    }

    /**
     * Delete category
     * Note: This will cascade delete all menu items in the category
     * 
     * @param ownerId    Owner's user ID
     * @param categoryId Category ID
     */
    @Transactional
    public void deleteCategory(UUID ownerId, Long categoryId) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only delete categories from your own stores");
        }

        menuCategoryRepository.delete(category);
    }

    /**
     * Get categories for a specific store owned by the business owner
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @return List of categories for the store
     */
    public List<MenuCategoryResponse> getStoreCategories(UUID ownerId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only view categories for your own stores");
        }

        List<MenuCategory> categories = menuCategoryRepository.findByStoreId(storeId);
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Store entity to StoreResponse DTO
     */
    private StoreResponse convertToStoreResponse(Store store) {
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
                .status(store.getStatus() != null ? store.getStatus().name() : "ACTIVE")
                .createdAt(store.getCreatedAt())
                .build();
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
                .salaryType(user.getSalaryType())
                .salaryAmount(user.getSalaryAmount())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Convert MenuItem entity to MenuItemResponse DTO
     */
    private MenuItemResponse convertToMenuItemResponse(MenuItem item, String categoryName) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(categoryName)
                .name(item.getName())
                .price(item.getPrice())
                .status(item.getStatus())
                .build();
    }

    /**
     * Convert MenuCategory entity to MenuCategoryResponse DTO
     */
    private MenuCategoryResponse convertToCategoryResponse(MenuCategory category) {
        return MenuCategoryResponse.builder()
                .id(category.getId())
                .storeId(category.getStore().getId())
                .storeName(category.getStore().getName())
                .name(category.getName())
                .itemCount(menuItemRepository.countByCategoryId(category.getId()))
                .build();
    }

    /**
     * Get all shift templates for a specific store
     * 
     * @param ownerId Owner's user ID
     * @param storeId Store ID
     * @return List of shift templates
     */
    public List<WorkShiftResponse> getShiftTemplates(UUID ownerId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only view shift templates for your own stores");
        }

        List<WorkShift> shifts = workShiftRepository.findByStoreId(storeId);
        return shifts.stream()
                .map(this::convertToWorkShiftResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create shift template for a store
     * 
     * @param ownerId Owner's user ID
     * @param request Shift template request
     * @return Created shift template
     */
    @Transactional
    public WorkShiftResponse createShiftTemplate(UUID ownerId, WorkShiftRequest request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only create shift templates for your own stores");
        }

        WorkShift workShift = WorkShift.builder()
                .store(store)
                .name(request.getName())
                .startTime(java.time.LocalTime.parse(request.getStartTime()))
                .endTime(java.time.LocalTime.parse(request.getEndTime()))
                .build();

        WorkShift savedShift = workShiftRepository.save(workShift);
        return convertToWorkShiftResponse(savedShift);
    }

    /**
     * Update shift template
     * 
     * @param ownerId Owner's user ID
     * @param shiftId Shift template ID
     * @param request Shift template request
     * @return Updated shift template
     */
    @Transactional
    public WorkShiftResponse updateShiftTemplate(UUID ownerId, Long shiftId, WorkShiftRequest request) {
        WorkShift workShift = workShiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift template not found with ID: " + shiftId));

        // Verify ownership
        if (!workShift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only update shift templates for your own stores");
        }

        workShift.setName(request.getName());
        workShift.setStartTime(java.time.LocalTime.parse(request.getStartTime()));
        workShift.setEndTime(java.time.LocalTime.parse(request.getEndTime()));

        WorkShift updatedShift = workShiftRepository.save(workShift);
        return convertToWorkShiftResponse(updatedShift);
    }

    /**
     * Delete shift template
     * 
     * @param ownerId Owner's user ID
     * @param shiftId Shift template ID
     */
    @Transactional
    public void deleteShiftTemplate(UUID ownerId, Long shiftId) {
        WorkShift workShift = workShiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift template not found with ID: " + shiftId));

        // Verify ownership
        if (!workShift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You can only delete shift templates from your own stores");
        }

        workShiftRepository.delete(workShift);
    }

    /**
     * Convert WorkShift entity to WorkShiftResponse DTO
     */
    private WorkShiftResponse convertToWorkShiftResponse(WorkShift workShift) {
        return WorkShiftResponse.builder()
                .id(workShift.getId())
                .storeId(workShift.getStore().getId())
                .storeName(workShift.getStore().getName())
                .name(workShift.getName())
                .startTime(workShift.getStartTime().toString())
                .endTime(workShift.getEndTime().toString())
                .build();
    }

    /**
     * Convert Tables entity to TableResponse DTO
     */
    private TableResponse convertToTableResponse(Tables table) {
        return TableResponse.builder()
                .id(table.getId())
                .storeId(table.getStore().getId())
                .storeName(table.getStore().getName())
                .name(table.getName())
                .status(table.getStatus())
                .currentOrderId(null) // Will be populated by TableService if needed
                .build();
    }

    /**
     * Get QR payment code for business owner
     * 
     * @param userId Owner's user ID
     * @return QR payment code response or null if not found
     */
    public QRPaymentResponse getQRPaymentCode(UUID userId) {
        return qrPaymentCodeRepository.findByUserId(userId)
                .map(this::convertToQRPaymentResponse)
                .orElse(null);
    }

    /**
     * Create QR payment code for business owner
     * Enforces single image constraint - only one QR code per user
     * 
     * @param userId  Owner's user ID
     * @param request QR payment request
     * @return Created QR payment code response
     */
    @Transactional
    public QRPaymentResponse createQRPaymentCode(UUID userId, QRPaymentRequest request) {
        // Verify user exists and is a business owner
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.BUSINESS_OWNER) {
            throw new InvalidRoleException("Only BUSINESS_OWNER can create QR payment codes");
        }

        // Check if user already has a QR code
        if (qrPaymentCodeRepository.existsByUserId(userId)) {
            throw new InvalidRoleException("QR payment code already exists. Please update or delete the existing one.");
        }

        QRPaymentCode qrCode = QRPaymentCode.builder()
                .user(user)
                .imageData(request.getImageData())
                .imageName(request.getImageName())
                .imageType(request.getImageType())
                .build();

        QRPaymentCode savedQRCode = qrPaymentCodeRepository.save(qrCode);
        return convertToQRPaymentResponse(savedQRCode);
    }

    /**
     * Update QR payment code for business owner
     * 
     * @param userId  Owner's user ID
     * @param request QR payment request
     * @return Updated QR payment code response
     */
    @Transactional
    public QRPaymentResponse updateQRPaymentCode(UUID userId, QRPaymentRequest request) {
        QRPaymentCode qrCode = qrPaymentCodeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("QR payment code not found"));

        // Verify ownership
        if (!qrCode.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own QR payment code");
        }

        qrCode.setImageData(request.getImageData());
        qrCode.setImageName(request.getImageName());
        qrCode.setImageType(request.getImageType());

        QRPaymentCode updatedQRCode = qrPaymentCodeRepository.save(qrCode);
        return convertToQRPaymentResponse(updatedQRCode);
    }

    /**
     * Delete QR payment code for business owner
     * 
     * @param userId Owner's user ID
     */
    @Transactional
    public void deleteQRPaymentCode(UUID userId) {
        QRPaymentCode qrCode = qrPaymentCodeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("QR payment code not found"));

        // Verify ownership
        if (!qrCode.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own QR payment code");
        }

        qrPaymentCodeRepository.delete(qrCode);
    }

    /**
     * Convert QRPaymentCode entity to QRPaymentResponse DTO
     */
    private QRPaymentResponse convertToQRPaymentResponse(QRPaymentCode qrCode) {
        return QRPaymentResponse.builder()
                .id(qrCode.getId())
                .imageData(qrCode.getImageData())
                .imageName(qrCode.getImageName())
                .imageType(qrCode.getImageType())
                .createdAt(qrCode.getCreatedAt())
                .updatedAt(qrCode.getUpdatedAt())
                .build();
    }
}
