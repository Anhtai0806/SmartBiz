package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.AvailabilitySubmitRequest;
import com.smartbiz.backend.dto.AvailabilityWeekResponse;
import com.smartbiz.backend.dto.WorkShiftResponse;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/shift-templates")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'KITCHEN')")
    public ResponseEntity<List<WorkShiftResponse>> getShiftTemplates(@RequestParam @NonNull Long storeId) {
        User currentUser = getCurrentUser();
        List<WorkShiftResponse> templates = availabilityService.getShiftTemplates(getCurrentUserId(currentUser),
                storeId);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/week")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'KITCHEN')")
    public ResponseEntity<AvailabilityWeekResponse> getMyAvailability(
            @RequestParam @NonNull Long storeId,
            @RequestParam(required = false) LocalDate weekStart) {
        User currentUser = getCurrentUser();
        AvailabilityWeekResponse response = availabilityService.getMyAvailability(getCurrentUserId(currentUser),
                storeId, weekStart);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/week")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'KITCHEN')")
    public ResponseEntity<AvailabilityWeekResponse> submitAvailability(
            @Valid @RequestBody @NonNull AvailabilitySubmitRequest request) {
        User currentUser = getCurrentUser();
        AvailabilityWeekResponse response = availabilityService.submitAvailability(getCurrentUserId(currentUser),
                request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/week")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'KITCHEN')")
    public ResponseEntity<AvailabilityWeekResponse> updateAvailability(
            @Valid @RequestBody @NonNull AvailabilitySubmitRequest request) {
        User currentUser = getCurrentUser();
        AvailabilityWeekResponse response = availabilityService.submitAvailability(getCurrentUserId(currentUser),
                request);
        return ResponseEntity.ok(response);
    }

    @NonNull
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = Objects.requireNonNull(authentication, "authentication must not be null").getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Authenticated principal is not a User");
        }
        return Objects.requireNonNull(user, "authenticated user must not be null");
    }

    @NonNull
    private UUID getCurrentUserId(@NonNull User user) {
        return Objects.requireNonNull(user.getId(), "currentUser.id must not be null");
    }
}
