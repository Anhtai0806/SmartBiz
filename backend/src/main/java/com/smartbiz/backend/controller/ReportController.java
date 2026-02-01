package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.RevenueReportResponse;
import com.smartbiz.backend.dto.StoreComparisonResponse;
import com.smartbiz.backend.dto.TopProductResponse;
import com.smartbiz.backend.service.ReportService;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.util.JwtUtil;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<RevenueReportResponse>> getRevenueReport(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        UUID ownerId = extractUserIdFromToken(token);
        return ResponseEntity.ok(reportService.getRevenueReport(ownerId, storeId, startDate, endDate));
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "10") int limit) {

        UUID ownerId = extractUserIdFromToken(token);
        return ResponseEntity.ok(reportService.getTopProducts(ownerId, storeId, startDate, endDate, limit));
    }

    @GetMapping("/store-comparison")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<StoreComparisonResponse>> getStoreComparison(
            @RequestHeader("Authorization") String token,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        UUID ownerId = extractUserIdFromToken(token);
        return ResponseEntity.ok(reportService.getStoreComparison(ownerId, startDate, endDate));
    }

    private UUID extractUserIdFromToken(String token) {
        String jwt = token.substring(7);
        String username = jwtUtil.extractEmail(jwt);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
