package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TablesRepository tablesRepository;
    private final OrderService orderService;

    /**
     * Create invoice and process payment (CASHIER)
     */
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        // Check if invoice already exists
        if (order.getInvoice() != null) {
            throw new IllegalStateException("Invoice already exists for this order");
        }

        // Calculate total amount
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        BigDecimal totalAmount = items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create invoice
        Invoice invoice = Invoice.builder()
                .order(order)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .build();

        Invoice saved = invoiceRepository.save(invoice);

        // Update order status to DONE
        order.setStatus(OrderStatus.DONE);
        orderRepository.save(order);

        // Update table status to PAID
        Tables table = order.getTable();
        table.setStatus(TableStatus.PAID);
        tablesRepository.save(table);

        return convertToResponse(saved);
    }

    /**
     * Get invoice by order ID
     */
    public InvoiceResponse getInvoiceByOrder(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order: " + orderId));
        return convertToResponse(invoice);
    }

    /**
     * Get invoices by store
     */
    public List<InvoiceResponse> getInvoicesByStore(Long storeId) {
        List<Invoice> invoices = invoiceRepository.findByOrderTableStoreId(storeId);
        return invoices.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private InvoiceResponse convertToResponse(Invoice invoice) {
        OrderResponse orderResponse = orderService.convertToResponse(invoice.getOrder());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .orderId(invoice.getOrder().getId())
                .totalAmount(invoice.getTotalAmount())
                .paymentMethod(invoice.getPaymentMethod())
                .createdAt(invoice.getCreatedAt())
                .order(orderResponse)
                .build();
    }
}
