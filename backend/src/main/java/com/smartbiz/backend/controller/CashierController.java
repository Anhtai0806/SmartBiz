package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.service.CashierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Cashier-specific endpoints for dashboard and order management
 */
@RestController
@RequestMapping("/api/cashier")
@RequiredArgsConstructor
public class CashierController {

    private final CashierService cashierService;

    /**
     * Get dashboard statistics for cashier
     * Shows today's orders, completed orders, pending payments, and revenue
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<CashierDashboardStatsResponse> getDashboardStats(
            @RequestParam Long storeId) {
        CashierDashboardStatsResponse stats = cashierService.getDashboardStats(storeId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all orders for today filtered by store
     */
    @GetMapping("/orders/today")
    @PreAuthorize("hasAnyRole('CASHIER', 'STAFF', 'BUSINESS_OWNER')")
    public ResponseEntity<List<OrderResponse>> getTodayOrders(
            @RequestParam Long storeId) {
        List<OrderResponse> orders = cashierService.getTodayOrders(storeId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders that are waiting for payment
     */
    @GetMapping("/orders/pending-payment")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<List<OrderResponse>> getPendingPaymentOrders(
            @RequestParam Long storeId) {
        List<OrderResponse> orders = cashierService.getPendingPaymentOrders(storeId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get tables that have active orders (for payment processing)
     */
    @GetMapping("/tables/with-orders")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<List<TableResponse>> getTablesWithOrders(
            @RequestParam Long storeId) {
        List<TableResponse> tables = cashierService.getTablesWithOrders(storeId);
        return ResponseEntity.ok(tables);
    }

    /**
     * Get staff for store (for schedule view)
     */
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER', 'STAFF')")
    public ResponseEntity<List<UserResponse>> getStoreStaff(
            @RequestParam Long storeId) {
        List<UserResponse> staff = cashierService.getStoreStaff(storeId);
        return ResponseEntity.ok(staff);
    }

    // --- Invoice Management ---

    private final com.smartbiz.backend.service.InvoiceService invoiceService;
    private final com.smartbiz.backend.service.BusinessOwnerService businessOwnerService;
    private final com.smartbiz.backend.repository.StoreRepository storeRepository;

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceResponse invoice = invoiceService.createInvoice(request);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/qr-payment/store/{storeId}")
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER', 'STAFF')")
    public ResponseEntity<QRPaymentResponse> getStoreQR(@PathVariable Long storeId) {
        // Get store owner
        com.smartbiz.backend.entity.Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new com.smartbiz.backend.exception.ResourceNotFoundException("Store not found"));

        com.smartbiz.backend.entity.User owner = store.getOwner();
        QRPaymentResponse qr = businessOwnerService.getQRPaymentCode(owner.getId());
        return ResponseEntity.ok(qr);
    }
}
