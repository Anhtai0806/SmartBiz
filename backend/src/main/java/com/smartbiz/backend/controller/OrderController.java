package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Order Management endpoints
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Get order by table
     */
    @GetMapping("/table/{tableId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<OrderResponse> getOrderByTable(@PathVariable @NonNull Long tableId) {
        OrderResponse order = orderService.getOrderByTable(tableId);
        return ResponseEntity.ok(order);
    }

    /**
     * Get orders by shift
     */
    @GetMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<List<OrderResponse>> getOrdersByShift(@PathVariable @NonNull Long shiftId) {
        List<OrderResponse> orders = orderService.getOrdersByShift(shiftId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders by store
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<OrderResponse>> getOrdersByStore(@PathVariable @NonNull Long storeId) {
        List<OrderResponse> orders = orderService.getOrdersByStore(storeId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Create a new order (STAFF)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER')")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody @NonNull OrderRequest request) {
        User currentUser = getCurrentUser();
        OrderResponse order = orderService.createOrder(getCurrentUserId(currentUser), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Add item to order
     */
    @PostMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER')")
    public ResponseEntity<OrderResponse> addItemToOrder(
            @PathVariable @NonNull Long orderId,
            @Valid @RequestBody @NonNull OrderItemRequest request) {
        OrderResponse order = orderService.addItemToOrder(orderId, request);
        return ResponseEntity.ok(order);
    }

    /**
     * Update order status (CASHIER)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable @NonNull Long orderId,
            @Valid @RequestBody @NonNull OrderStatusRequest request) {
        OrderResponse order = orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(order);
    }

    /**
     * Remove item from order (CASHIER, STAFF)
     */
    @DeleteMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<OrderResponse> removeItemFromOrder(
            @PathVariable @NonNull Long orderId,
            @PathVariable @NonNull Long itemId) {
        OrderResponse order = orderService.removeItemFromOrder(orderId, itemId);
        return ResponseEntity.ok(order);
    }

    /**
     * Update order item quantity (CASHIER, STAFF)
     */
    @PutMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<OrderResponse> updateOrderItem(
            @PathVariable @NonNull Long orderId,
            @PathVariable @NonNull Long itemId,
            @Valid @RequestBody @NonNull UpdateOrderItemRequest request) {
        OrderResponse order = orderService.updateOrderItem(orderId, itemId, request);
        return ResponseEntity.ok(order);
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
