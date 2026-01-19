package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.Role;
import com.smartbiz.backend.entity.Status;
import com.smartbiz.backend.entity.Store;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.exception.EmailOrPhoneAlreadyExistsException;
import com.smartbiz.backend.exception.InvalidRoleException;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
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
                .build();

        Store savedStore = storeRepository.save(store);

        return convertToStoreResponse(savedStore);
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

        // Validate role - only STAFF or CASHIER allowed
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid role: " + request.getRole());
        }

        if (role != Role.STAFF && role != Role.CASHIER) {
            throw new InvalidRoleException("Only STAFF or CASHIER roles can be created. Cannot create: " + role);
        }

        // Create staff user
        User staff = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(Status.ACTIVE)
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
        if (staff.getRole() != Role.STAFF && staff.getRole() != Role.CASHIER) {
            throw new InvalidRoleException("Only STAFF or CASHIER can be assigned to stores");
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
        if (staff.getRole() != Role.STAFF && staff.getRole() != Role.CASHIER) {
            throw new InvalidRoleException("Can only update status for STAFF or CASHIER");
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
     * Convert Store entity to StoreResponse DTO
     */
    private StoreResponse convertToStoreResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .ownerId(store.getOwner().getId())
                .ownerName(store.getOwner().getFullName())
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
                .createdAt(user.getCreatedAt())
                .build();
    }
}
