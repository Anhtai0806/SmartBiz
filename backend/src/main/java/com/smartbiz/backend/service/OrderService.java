package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.OrderStatus;
import com.smartbiz.backend.enums.TableStatus;
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
                List<Order> orders = orderRepository.findActiveOrderByTableId(tableId);

                if (orders.isEmpty()) {
                        throw new ResourceNotFoundException(
                                        "No active order found for table: " + tableId);
                }

                // Return the most recent order (first in the list due to ORDER BY createdAt
                // DESC)
                Order order = orders.get(0);
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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Table not found with id: " + request.getTableId()));

                // Find or validate shift
                StaffShift shift = staffShiftRepository.findById(request.getShiftId()).orElse(null);

                // If shift not found or doesn't belong to current user, try to find today's
                // shift
                if (shift == null || !shift.getUser().getId().equals(staffId)) {
                        List<StaffShift> userShifts = staffShiftRepository.findByUserIdAndShiftDate(
                                        staffId,
                                        java.time.LocalDate.now());

                        if (userShifts.isEmpty()) {
                                throw new IllegalArgumentException(
                                                "Không tìm thấy ca làm việc cho user này hôm nay. Vui lòng tạo ca làm việc trước.");
                        }

                        // Use the first shift found for today
                        // Note: Working hours validation is already done in
                        // TableService.updateTableStatus()
                        // when the table status was changed to SERVING
                        shift = userShifts.get(0);
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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                                .orElseThrow(
                                                () -> new ResourceNotFoundException("Menu item not found with id: "
                                                                + request.getMenuItemId()));

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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                order.setStatus(request.getStatus());

                // Update table status based on order status
                if (request.getStatus() == OrderStatus.DONE) {
                        order.getTable().setStatus(TableStatus.WAITING_PAYMENT);
                }

                Order updated = orderRepository.save(order);
                return convertToResponse(updated);
        }

        /**
         * Remove item from order
         */
        @Transactional
        public OrderResponse removeItemFromOrder(Long orderId, Long itemId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                OrderItem itemToRemove = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order item not found with id: " + itemId));

                // Verify item belongs to this order
                if (!itemToRemove.getOrder().getId().equals(orderId)) {
                        throw new IllegalArgumentException("Item does not belong to this order");
                }

                // Check if this is the last item
                List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
                if (items.size() <= 1) {
                        throw new IllegalStateException(
                                        "Cannot remove the last item from order. Please cancel the order instead.");
                }

                orderItemRepository.delete(itemToRemove);
                return convertToResponse(order);
        }

        /**
         * Update order item quantity
         */
        @Transactional
        public OrderResponse updateOrderItem(Long orderId, Long itemId, UpdateOrderItemRequest request) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                OrderItem item = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order item not found with id: " + itemId));

                // Verify item belongs to this order
                if (!item.getOrder().getId().equals(orderId)) {
                        throw new IllegalArgumentException("Item does not belong to this order");
                }

                item.setQuantity(request.getQuantity());
                orderItemRepository.save(item);

                return convertToResponse(order);
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

        /**
         * Get all pending orders for kitchen (NEW and PROCESSING status)
         * Sorted by creation time (oldest first)
         */
        public List<OrderResponse> getPendingOrdersForKitchen() {
                List<Order> orders = orderRepository.findByStatusInOrderByCreatedAtAsc(
                                List.of(OrderStatus.NEW, OrderStatus.PROCESSING));
                return orders.stream()
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Mark an order as completed (DONE status)
         */
        @Transactional
        public OrderResponse markOrderAsCompleted(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                // Update status to DONE
                order.setStatus(OrderStatus.DONE);
                orderRepository.save(order);

                return convertToResponse(order);
        }

        /**
         * Get count of pending orders for kitchen
         */
        public long getPendingOrdersCount() {
                return orderRepository.countByStatusIn(
                                List.of(OrderStatus.NEW, OrderStatus.PROCESSING));
        }

        /**
         * Get count of completed orders today
         */
        public long getCompletedOrdersTodayCount() {
                java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now()
                                .withHour(0).withMinute(0).withSecond(0).withNano(0);
                return orderRepository.countByStatusAndCreatedAtAfter(
                                OrderStatus.DONE, startOfDay);
        }
}
