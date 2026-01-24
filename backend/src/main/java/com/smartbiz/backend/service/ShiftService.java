package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final StaffShiftRepository staffShiftRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * Get shifts by store (BUSINESS_OWNER)
     */
    public List<ShiftResponse> getShiftsByStore(Long storeId) {
        List<StaffShift> shifts = staffShiftRepository.findByStoreId(storeId);
        return shifts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get shifts for current user
     */
    public List<ShiftResponse> getMyShifts(UUID userId) {
        List<StaffShift> shifts = staffShiftRepository.findByUserId(userId);
        return shifts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new shift (BUSINESS_OWNER only)
     */
    @Transactional
    public ShiftResponse createShift(UUID ownerId, Long storeId, ShiftRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create shifts for this store");
        }

        // Verify user is staff/cashier
        if (user.getRole() != Role.STAFF && user.getRole() != Role.CASHIER) {
            throw new IllegalArgumentException("Only STAFF or CASHIER can be assigned to shifts");
        }

        // Verify staff is assigned to this store
        boolean isStaffInStore = store.getStaffMembers().stream()
                .anyMatch(staff -> staff.getId().equals(user.getId()));
        if (!isStaffInStore) {
            throw new IllegalArgumentException(
                    "Staff member '" + user.getFullName() + "' is not assigned to store '" + store.getName() + "'");
        }

        StaffShift shift = StaffShift.builder()
                .user(user)
                .store(store)
                .shiftDate(request.getShiftDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        StaffShift saved = staffShiftRepository.save(shift);
        return convertToResponse(saved);
    }

    /**
     * Update a shift
     */
    @Transactional
    public ShiftResponse updateShift(UUID ownerId, Long storeId, Long shiftId, ShiftRequest request) {
        StaffShift shift = staffShiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + shiftId));

        // Verify ownership
        if (!shift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this shift");
        }

        // Verify shift belongs to the specified store
        if (!shift.getStore().getId().equals(storeId)) {
            throw new IllegalArgumentException("Shift does not belong to the specified store");
        }

        shift.setShiftDate(request.getShiftDate());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());

        StaffShift updated = staffShiftRepository.save(shift);
        return convertToResponse(updated);
    }

    /**
     * Get shifts by store and date range for calendar view (BUSINESS_OWNER)
     */
    public List<ShiftResponse> getShiftsByStoreAndDateRange(UUID ownerId, Long storeId,
            LocalDate startDate, LocalDate endDate) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to view shifts for this store");
        }

        List<StaffShift> shifts = staffShiftRepository.findByStoreIdAndShiftDateBetween(storeId, startDate, endDate);
        return shifts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a shift
     */
    @Transactional
    public void deleteShift(UUID ownerId, Long shiftId) {
        StaffShift shift = staffShiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + shiftId));

        // Verify ownership
        if (!shift.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this shift");
        }

        staffShiftRepository.delete(shift);
    }

    private ShiftResponse convertToResponse(StaffShift shift) {
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
}
