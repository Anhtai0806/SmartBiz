package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.OrderResponse;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kitchen endpoints for managing order preparation
 */
@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final OrderService orderService;

    /**
     * Get all pending orders sorted by creation time (oldest first)
     * Accessible by KITCHEN role only
     */
    @GetMapping("/orders/pending")
    @PreAuthorize("hasRole('KITCHEN')")
    public ResponseEntity<List<OrderResponse>> getPendingOrders() {
        List<OrderResponse> orders = orderService.getPendingOrdersForKitchen();
        return ResponseEntity.ok(orders);
    }

    /**
     * Mark an order as completed (ready to serve)
     * Accessible by KITCHEN role only
     */
    @PutMapping("/orders/{orderId}/complete")
    @PreAuthorize("hasRole('KITCHEN')")
    public ResponseEntity<OrderResponse> markOrderAsCompleted(@PathVariable Long orderId) {
        User currentUser = getCurrentUser();
        OrderResponse order = orderService.markOrderAsCompleted(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Get kitchen dashboard stats
     * Accessible by KITCHEN role only
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('KITCHEN')")
    public ResponseEntity<KitchenStatsResponse> getKitchenStats() {
        // Get stats for kitchen dashboard
        long pendingCount = orderService.getPendingOrdersCount();
        long completedToday = orderService.getCompletedOrdersTodayCount();

        KitchenStatsResponse stats = KitchenStatsResponse.builder()
                .pendingOrders(pendingCount)
                .completedToday(completedToday)
                .build();

        return ResponseEntity.ok(stats);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    // Inner DTO class for kitchen stats
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class KitchenStatsResponse {
        private long pendingOrders;
        private long completedToday;
    }
}
