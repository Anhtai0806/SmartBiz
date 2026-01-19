package com.smartbiz.backend.controller;

import com.smartbiz.backend.entity.StaffShift;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.repository.StaffShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Staff and Cashier endpoints
 * Accessible by STAFF, CASHIER, BUSINESS_OWNER, and ADMIN roles
 */
@RestController
@RequestMapping("/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffShiftRepository staffShiftRepository;

    /**
     * Get shifts for current user
     * Accessible by STAFF, CASHIER, BUSINESS_OWNER, and ADMIN
     */
    @GetMapping("/shifts")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyShifts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        List<StaffShift> shifts = staffShiftRepository.findByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("role", user.getRole().name());
        response.put("shiftCount", shifts.size());
        response.put("shifts", shifts);

        return ResponseEntity.ok(response);
    }

    /**
     * Staff dashboard
     * Accessible by STAFF, CASHIER, BUSINESS_OWNER, and ADMIN
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER', 'ADMIN')")
    public ResponseEntity<String> getStaffDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok("Welcome to Staff Dashboard, " + user.getRole().name());
    }
}
