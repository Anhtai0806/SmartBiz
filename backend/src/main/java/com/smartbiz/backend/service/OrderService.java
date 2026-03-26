package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.enums.OrderStatus;
import com.smartbiz.backend.enums.TableStatus;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
        public OrderResponse getOrderByTable(@NonNull Long tableId) {
                List<Order> orders = orderRepository.findActiveOrderByTableId(requireValue(tableId, "tableId"));

                if (orders.isEmpty()) {
                        throw new ResourceNotFoundException(
                                        "No active order found for table: " + tableId);
                }

                // Return the most recent order (first in the list due to ORDER BY createdAt
                // DESC)
                Order order = orders.get(0);
                return convertToResponse(requireValue(order, "order"));
        }

        /**
         * Get orders by shift
         */
        public List<OrderResponse> getOrdersByShift(@NonNull Long shiftId) {
                List<Order> orders = orderRepository.findByShiftId(requireValue(shiftId, "shiftId"));
                return orders.stream()
                                .map(order -> convertToResponse(requireValue(order, "order")))
                                .collect(Collectors.toList());
        }

        /**
         * Get orders by store
         */
        public List<OrderResponse> getOrdersByStore(@NonNull Long storeId) {
                List<Order> orders = orderRepository.findByStoreId(requireValue(storeId, "storeId"));
                return orders.stream()
                                .map(order -> convertToResponse(requireValue(order, "order")))
                                .collect(Collectors.toList());
        }

        /**
         * Create a new order (STAFF)
         */
        @Transactional
        public OrderResponse createOrder(@NonNull UUID staffId, @NonNull OrderRequest request) {
                Long tableId = requireValue(request.getTableId(), "tableId");
                Tables table = tablesRepository.findById(tableId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Table not found with id: " + request.getTableId()));

                // Find or validate shift
                Long shiftId = requireValue(request.getShiftId(), "shiftId");
                StaffShift shift = staffShiftRepository.findById(shiftId).orElse(null);

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

                Order savedOrder = orderRepository.save(requireValue(order, "order"));

                // Add items if provided
                if (request.getItems() != null && !request.getItems().isEmpty()) {
                        for (OrderItemRequest itemRequest : request.getItems()) {
                                addItemToOrder(requireValue(savedOrder.getId(), "savedOrder.id"),
                                                requireValue(itemRequest, "itemRequest"));
                        }
                }

                // Update table status
                table.setStatus(TableStatus.SERVING);
                tablesRepository.save(requireValue(table, "table"));

                Long savedOrderId = requireValue(savedOrder.getId(), "savedOrder.id");
                return convertToResponse(requireValue(orderRepository.findById(savedOrderId).orElseThrow(), "savedOrder"));
        }

        /**
         * Add item to order
         */
        @Transactional
        public OrderResponse addItemToOrder(@NonNull Long orderId, @NonNull OrderItemRequest request) {
                Order order = orderRepository.findById(requireValue(orderId, "orderId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                Long menuItemId = requireValue(request.getMenuItemId(), "menuItemId");
                MenuItem menuItem = menuItemRepository.findById(menuItemId)
                                .orElseThrow(
                                                () -> new ResourceNotFoundException("Menu item not found with id: "
                                                                + request.getMenuItemId()));

                OrderItem orderItem = requireValue(OrderItem.builder()
                                .order(order)
                                .menuItem(menuItem)
                                .quantity(request.getQuantity())
                                .price(menuItem.getPrice())
                                .build(), "orderItem");

                orderItemRepository.save(requireValue(orderItem, "orderItem"));
                return convertToResponse(requireValue(order, "order"));
        }

        /**
         * Update order status (CASHIER)
         */
        @Transactional
        public OrderResponse updateOrderStatus(@NonNull Long orderId, @NonNull OrderStatusRequest request) {
                Order order = orderRepository.findById(requireValue(orderId, "orderId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                order.setStatus(request.getStatus());

                // Update table status based on order status
                if (request.getStatus() == OrderStatus.DONE) {
                        order.getTable().setStatus(TableStatus.WAITING_PAYMENT);
                }

                Order updated = orderRepository.save(requireValue(order, "order"));
                return convertToResponse(requireValue(updated, "updatedOrder"));
        }

        /**
         * Remove item from order
         */
        @Transactional
        public OrderResponse removeItemFromOrder(@NonNull Long orderId, @NonNull Long itemId) {
                Order order = orderRepository.findById(requireValue(orderId, "orderId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                OrderItem itemToRemove = orderItemRepository.findById(requireValue(itemId, "itemId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order item not found with id: " + itemId));

                // Verify item belongs to this order
                if (!itemToRemove.getOrder().getId().equals(orderId)) {
                        throw new IllegalArgumentException("Item does not belong to this order");
                }

                // Check if this is the last item
                List<OrderItem> items = orderItemRepository.findByOrderId(requireValue(orderId, "orderId"));
                if (items.size() <= 1) {
                        throw new IllegalStateException(
                                        "Cannot remove the last item from order. Please cancel the order instead.");
                }

                orderItemRepository.delete(requireValue(itemToRemove, "itemToRemove"));
                return convertToResponse(requireValue(order, "order"));
        }

        /**
         * Update order item quantity
         */
        @Transactional
        public OrderResponse updateOrderItem(@NonNull Long orderId, @NonNull Long itemId,
                        @NonNull UpdateOrderItemRequest request) {
                Order order = orderRepository.findById(requireValue(orderId, "orderId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                OrderItem item = orderItemRepository.findById(requireValue(itemId, "itemId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order item not found with id: " + itemId));

                // Verify item belongs to this order
                if (!item.getOrder().getId().equals(orderId)) {
                        throw new IllegalArgumentException("Item does not belong to this order");
                }

                item.setQuantity(request.getQuantity());
                orderItemRepository.save(requireValue(item, "item"));

                return convertToResponse(requireValue(order, "order"));
        }

        /**
         * Convert Order entity to response DTO
         */
        public OrderResponse convertToResponse(@NonNull Order order) {
                Long orderId = requireValue(order.getId(), "order.id");
                List<OrderItemResponse> items = orderItemRepository.findByOrderId(orderId).stream()
                                .map(item -> convertToItemResponse(requireValue(item, "item")))
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

        private OrderItemResponse convertToItemResponse(@NonNull OrderItem item) {
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
                                .map(order -> convertToResponse(requireValue(order, "order")))
                                .collect(Collectors.toList());
        }

        /**
         * Mark an order as completed (DONE status)
         */
        @Transactional
        public OrderResponse markOrderAsCompleted(@NonNull Long orderId) {
                Order order = orderRepository.findById(requireValue(orderId, "orderId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found with id: " + orderId));

                // Update status to DONE
                order.setStatus(OrderStatus.DONE);
                orderRepository.save(requireValue(order, "order"));

                return convertToResponse(requireValue(order, "order"));
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

        @NonNull
        private <T> T requireValue(T value, String fieldName) {
                return Objects.requireNonNull(value, fieldName + " must not be null");
        }
}
