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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CashierService {

        private final OrderRepository orderRepository;
        private final OrderService orderService;
        private final InvoiceRepository invoiceRepository;
        private final TablesRepository tablesRepository;
        private final StoreRepository storeRepository;

        /**
         * Get dashboard statistics for cashier
         * Shows today's orders, completed orders, pending payments, and revenue
         */
        public CashierDashboardStatsResponse getDashboardStats(@NonNull Long storeId) {
                // Verify store exists
                storeRepository.findById(requireValue(storeId, "storeId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get today's date range
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                // Count total orders today
                Long totalOrders = orderRepository.countByStoreIdAndCreatedAtBetween(storeId, startOfDay, endOfDay);

                // Count completed orders (status = DONE)
                Long completedOrders = orderRepository.countByStoreIdAndStatusAndCreatedAtBetween(
                                storeId, OrderStatus.DONE, startOfDay, endOfDay);

                // Count pending payments (orders with status DONE but table status
                // WAITING_PAYMENT)
                Long pendingPayments = orderRepository.findByTableStoreIdAndStatus(storeId, OrderStatus.DONE).stream()
                                .filter(order -> order.getTable().getStatus() == TableStatus.WAITING_PAYMENT)
                                .count();

                // Calculate today's revenue from invoices
                BigDecimal todayRevenue = invoiceRepository.sumTotalAmountByStoreIdAndCreatedAtBetween(
                                storeId, startOfDay, endOfDay);

                return CashierDashboardStatsResponse.builder()
                                .totalOrders(totalOrders)
                                .completedOrders(completedOrders)
                                .pendingPayments(pendingPayments)
                                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                                .build();
        }

        /**
         * Get all orders for today filtered by store
         */
        public List<OrderResponse> getTodayOrders(@NonNull Long storeId) {
                // Verify store exists
                storeRepository.findById(requireValue(storeId, "storeId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get today's date range
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                // Get orders for today
                List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, startOfDay, endOfDay);

                return orders.stream()
                                .map(order -> orderService.convertToResponse(requireValue(order, "order")))
                                .collect(Collectors.toList());
        }

        /**
         * Get orders that are waiting for payment
         */
        public List<OrderResponse> getPendingPaymentOrders(@NonNull Long storeId) {
                // Verify store exists
                storeRepository.findById(requireValue(storeId, "storeId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get orders with DONE status (ready for payment)
                List<Order> orders = orderRepository.findByTableStoreIdAndStatus(storeId, OrderStatus.DONE);

                // Filter to only include orders where table is WAITING_PAYMENT
                return orders.stream()
                                .filter(order -> order.getTable().getStatus() == TableStatus.WAITING_PAYMENT)
                                .map(order -> orderService.convertToResponse(requireValue(order, "order")))
                                .collect(Collectors.toList());
        }

        /**
         * Get tables that have active orders (for payment processing)
         */
        public List<TableResponse> getTablesWithOrders(@NonNull Long storeId) {
                // Verify store exists
                storeRepository.findById(requireValue(storeId, "storeId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get all tables with WAITING_PAYMENT status
                List<Tables> tables = tablesRepository.findByStoreIdAndStatus(storeId, TableStatus.WAITING_PAYMENT);

                return tables.stream()
                                .map(table -> convertToTableResponse(requireValue(table, "table")))
                                .collect(Collectors.toList());
        }

        /**
         * Get staff members for a specific store (for schedule filtering)
         */
        public List<UserResponse> getStoreStaff(@NonNull Long storeId) {
                Store store = storeRepository.findById(requireValue(storeId, "storeId"))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                return store.getStaffMembers().stream()
                                .map(user -> convertToUserResponse(requireValue(user, "user")))
                                .collect(Collectors.toList());
        }

        private UserResponse convertToUserResponse(@NonNull User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .build();
        }

        /**
         * Convert Table entity to TableResponse DTO
         */
        private TableResponse convertToTableResponse(@NonNull Tables table) {
                return TableResponse.builder()
                                .id(table.getId())
                                .storeId(table.getStore().getId())
                                .name(table.getName())
                                .status(table.getStatus())
                                .build();
        }

        @NonNull
        private <T> T requireValue(T value, String fieldName) {
                return Objects.requireNonNull(value, fieldName + " must not be null");
        }
}
