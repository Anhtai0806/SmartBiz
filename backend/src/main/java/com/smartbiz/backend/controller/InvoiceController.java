package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Invoice/Payment endpoints
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Create invoice and process payment (CASHIER)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse invoice = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }

    /**
     * Get invoice by order ID
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrder(@PathVariable Long orderId) {
        InvoiceResponse invoice = invoiceService.getInvoiceByOrder(orderId);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Get invoices by store (BUSINESS_OWNER)
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByStore(@PathVariable Long storeId) {
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByStore(storeId);
        return ResponseEntity.ok(invoices);
    }
}
