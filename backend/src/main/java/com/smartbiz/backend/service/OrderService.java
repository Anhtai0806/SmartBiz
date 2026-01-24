package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TablesRepository tablesRepository;
    private final StaffShiftRepository staffShiftRepository;
    private final MenuItemRepository menuItemRepository;

    /**
     * Get order by table
     */
    public OrderResponse getOrderByTable(Long tableId) {
        Order order = orderRepository.findActiveOrderByTableId(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("No active order found for table: " + tableId));
        return convertToResponse(order);
    }

    /**
     * Get orders by shift
     */
    public List<OrderResponse> getOrdersByShift(Long shiftId) {
        List<Order> orders = orderRepository.findByShiftId(shiftId);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by store
     */
    public List<OrderResponse> getOrdersByStore(Long storeId) {
        List<Order> orders = orderRepository.findByStoreId(storeId);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new order (STAFF)
     */
    @Transactional
    public OrderResponse createOrder(UUID staffId, OrderRequest request) {
        Tables table = tablesRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + request.getTableId()));

        StaffShift shift = staffShiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + request.getShiftId()));

        // Verify staff is assigned to this shift
        if (!shift.getUser().getId().equals(staffId)) {
            throw new IllegalArgumentException("You are not assigned to this shift");
        }

        // Create order
        Order order = Order.builder()
                .table(table)
                .staff(shift.getUser())
                .shift(shift)
                .status(OrderStatus.NEW)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Add items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemRequest : request.getItems()) {
                addItemToOrder(savedOrder.getId(), itemRequest);
            }
        }

        // Update table status
        table.setStatus(TableStatus.SERVING);
        tablesRepository.save(table);

        return convertToResponse(orderRepository.findById(savedOrder.getId()).orElseThrow());
    }

    /**
     * Add item to order
     */
    @Transactional
    public OrderResponse addItemToOrder(Long orderId, OrderItemRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Menu item not found with id: " + request.getMenuItemId()));

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .menuItem(menuItem)
                .quantity(request.getQuantity())
                .price(menuItem.getPrice())
                .build();

        orderItemRepository.save(orderItem);
        return convertToResponse(order);
    }

    /**
     * Update order status (CASHIER)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(request.getStatus());

        // Update table status based on order status
        if (request.getStatus() == OrderStatus.DONE) {
            order.getTable().setStatus(TableStatus.WAITING_PAYMENT);
        }

        Order updated = orderRepository.save(order);
        return convertToResponse(updated);
    }

    /**
     * Convert Order entity to response DTO
     */
    public OrderResponse convertToResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(this::convertToItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(OrderItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return OrderResponse.builder()
                .id(order.getId())
                .tableId(order.getTable().getId())
                .tableName(order.getTable().getName())
                .staffId(order.getStaff().getId())
                .staffName(order.getStaff().getFullName())
                .shiftId(order.getShift().getId())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(items)
                .totalAmount(totalAmount)
                .build();
    }

    private OrderItemResponse convertToItemResponse(OrderItem item) {
        BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(subtotal)
                .build();
    }
}
