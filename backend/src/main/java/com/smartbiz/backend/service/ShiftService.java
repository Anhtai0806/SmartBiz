package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.Role;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShiftService {

    private final StaffShiftRepository staffShiftRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * Get shifts by store (BUSINESS_OWNER)
     */
    public List<ShiftResponse> getShiftsByStore(@NonNull Long storeId) {
        List<StaffShift> shifts = staffShiftRepository.findByStoreId(requireValue(storeId, "storeId"));
        return shifts.stream()
                .map(shift -> convertToResponse(requireValue(shift, "shift")))
                .collect(Collectors.toList());
    }

    /**
     * Get shifts for current user
     */
    public List<ShiftResponse> getMyShifts(@NonNull UUID userId) {
        List<StaffShift> shifts = staffShiftRepository.findByUserId(requireValue(userId, "userId"));
        return shifts.stream()
                .map(shift -> convertToResponse(requireValue(shift, "shift")))
                .collect(Collectors.toList());
    }

    /**
     * Create a new shift (BUSINESS_OWNER only)
     */
    @Transactional
    public ShiftResponse createShift(@NonNull UUID ownerId, @NonNull Long storeId, @NonNull ShiftRequest request) {
        UUID userId = requireValue(request.getUserId(), "userId");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Store store = storeRepository.findById(requireValue(storeId, "storeId"))
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create shifts for this store");
        }

        // Verify user is staff/cashier/kitchen
        if (user.getRole() != Role.STAFF && user.getRole() != Role.CASHIER && user.getRole() != Role.KITCHEN) {
            throw new IllegalArgumentException("Only STAFF, CASHIER, or KITCHEN can be assigned to shifts");
        }

        // Verify staff is assigned to this store
        boolean isStaffInStore = store.getStaffMembers().stream()
                .anyMatch(staff -> staff.getId().equals(user.getId()));
        if (!isStaffInStore) {
            throw new IllegalArgumentException(
                    "Staff member '" + user.getFullName() + "' is not assigned to store '" + store.getName() + "'");
        }

        StaffShift shift = requireValue(StaffShift.builder()
                .user(user)
                .store(store)
                .shiftDate(request.getShiftDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build(), "shift");

        StaffShift saved = staffShiftRepository.save(requireValue(shift, "shift"));
        return convertToResponse(requireValue(saved, "savedShift"));
    }

    /**
     * Update a shift
     */
    @Transactional
    public ShiftResponse updateShift(@NonNull UUID ownerId, @NonNull Long storeId, @NonNull Long shiftId,
            @NonNull ShiftRequest request) {
        StaffShift shift = staffShiftRepository.findById(requireValue(shiftId, "shiftId"))
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + shiftId));

        // Verify ownership
        if (!shift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this shift");
        }

        // Verify shift belongs to the specified store
        if (!shift.getStore().getId().equals(requireValue(storeId, "storeId"))) {
            throw new IllegalArgumentException("Shift does not belong to the specified store");
        }

        shift.setShiftDate(request.getShiftDate());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());

        StaffShift updated = staffShiftRepository.save(requireValue(shift, "shift"));
        return convertToResponse(requireValue(updated, "updatedShift"));
    }

    /**
     * Get shifts by store and date range for calendar view
     * Accessible by Owner, Cashier, and Staff
     */
    public List<ShiftResponse> getShiftsByStoreAndDateRange(@NonNull UUID requesterId, @NonNull Long storeId,
            LocalDate startDate, LocalDate endDate) {
        Store store = storeRepository.findById(requireValue(storeId, "storeId"))
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        User requester = userRepository.findById(requireValue(requesterId, "requesterId"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAllowed = false;

        if (requester.getRole() == Role.BUSINESS_OWNER) {
            // Verify ownership
            if (store.getOwner().getId().equals(requesterId)) {
                isAllowed = true;
            }
        } else if (requester.getRole() == Role.STAFF || requester.getRole() == Role.CASHIER
                || requester.getRole() == Role.KITCHEN) {
            // Verify assigned to store
            boolean isAssigned = store.getStaffMembers().stream()
                    .anyMatch(staff -> staff.getId().equals(requesterId));
            if (isAssigned) {
                isAllowed = true;
            }
        }

        if (!isAllowed) {
            throw new UnauthorizedException("You don't have permission to view shifts for this store");
        }

        List<StaffShift> shifts = staffShiftRepository.findByStoreIdAndShiftDateBetween(storeId, startDate, endDate);
        return shifts.stream()
                .map(shift -> convertToResponse(requireValue(shift, "shift")))
                .collect(Collectors.toList());
    }

    /**
     * Delete a shift
     */
    @Transactional
    public void deleteShift(@NonNull UUID ownerId, @NonNull Long shiftId) {
        StaffShift shift = staffShiftRepository.findById(requireValue(shiftId, "shiftId"))
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + shiftId));

        // Verify ownership
        if (!shift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this shift");
        }

        staffShiftRepository.delete(requireValue(shift, "shift"));
    }

    private ShiftResponse convertToResponse(@NonNull StaffShift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .userId(shift.getUser().getId())
                .userFullName(shift.getUser().getFullName())
                .userRole(shift.getUser().getRole().name())
                .storeId(shift.getStore().getId())
                .storeName(shift.getStore().getName())
                .shiftDate(shift.getShiftDate())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .build();
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
