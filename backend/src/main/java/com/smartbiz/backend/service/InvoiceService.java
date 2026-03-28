package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.CreateInvoiceRequest;
import com.smartbiz.backend.dto.InvoiceResponse;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.OrderStatus;
import com.smartbiz.backend.enums.TableStatus;
import com.smartbiz.backend.repository.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final TablesRepository tableRepository;
    private final OrderService orderService;

    @Transactional
    public InvoiceResponse createInvoice(@NonNull CreateInvoiceRequest request) {
        Long orderId = requireValue(request.getOrderId(), "orderId");
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Tables table = order.getTable();

        // Validate table status
        if (table.getStatus() != TableStatus.SERVING && table.getStatus() != TableStatus.WAITING_PAYMENT) {
            throw new IllegalStateException("Table must be in SERVING or WAITING_PAYMENT status to create invoice");
        }

        // Ensure order has items
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new IllegalStateException("Cannot create invoice for empty order");
        }

        // Check if invoice already exists
        if (invoiceRepository.existsByOrderId(order.getId())) {
            throw new IllegalStateException("Invoice already exists for this order");
        }

        // Calculate Total Amount
        BigDecimal totalAmount = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create invoice
        Invoice invoice = Invoice.builder()
                .order(order)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .build();

        Invoice savedInvoice = invoiceRepository.save(requireValue(invoice, "invoice"));

        // Update Order Status
        order.setStatus(OrderStatus.DONE);
        orderRepository.save(order);

        // Update Table Status to PAID
        table.setStatus(TableStatus.PAID);
        tableRepository.save(table);

        return convertToInvoiceResponse(requireValue(savedInvoice, "savedInvoice"));
    }

    private InvoiceResponse convertToInvoiceResponse(@NonNull Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .orderId(invoice.getOrder().getId())
                .totalAmount(invoice.getTotalAmount())
                .paymentMethod(invoice.getPaymentMethod())
                .createdAt(invoice.getCreatedAt())
                .order(orderService.convertToResponse(requireValue(invoice.getOrder(), "order")))
                .build();
    }

    public InvoiceResponse getInvoiceByOrder(@NonNull Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(requireValue(orderId, "orderId"))
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order id: " + orderId));
        return convertToInvoiceResponse(requireValue(invoice, "invoice"));
    }

    public java.util.List<InvoiceResponse> getInvoicesByStore(@NonNull Long storeId) {
        return invoiceRepository.findByStoreId(requireValue(storeId, "storeId")).stream()
                .map(invoice -> convertToInvoiceResponse(requireValue(invoice, "invoice")))
                .collect(java.util.stream.Collectors.toList());
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
