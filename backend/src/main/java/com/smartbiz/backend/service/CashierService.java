package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        public CashierDashboardStatsResponse getDashboardStats(Long storeId) {
                // Verify store exists
                storeRepository.findById(storeId)
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
        public List<OrderResponse> getTodayOrders(Long storeId) {
                // Verify store exists
                storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get today's date range
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                // Get orders for today
                List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, startOfDay, endOfDay);

                return orders.stream()
                                .map(orderService::convertToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get orders that are waiting for payment
         */
        public List<OrderResponse> getPendingPaymentOrders(Long storeId) {
                // Verify store exists
                storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get orders with DONE status (ready for payment)
                List<Order> orders = orderRepository.findByTableStoreIdAndStatus(storeId, OrderStatus.DONE);

                // Filter to only include orders where table is WAITING_PAYMENT
                return orders.stream()
                                .filter(order -> order.getTable().getStatus() == TableStatus.WAITING_PAYMENT)
                                .map(orderService::convertToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get tables that have active orders (for payment processing)
         */
        public List<TableResponse> getTablesWithOrders(Long storeId) {
                // Verify store exists
                storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                // Get all tables with WAITING_PAYMENT status
                List<Tables> tables = tablesRepository.findByStoreIdAndStatus(storeId, TableStatus.WAITING_PAYMENT);

                return tables.stream()
                                .map(this::convertToTableResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get staff members for a specific store (for schedule filtering)
         */
        public List<UserResponse> getStoreStaff(Long storeId) {
                Store store = storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Store not found with id: " + storeId));

                return store.getStaffMembers().stream()
                                .map(this::convertToUserResponse)
                                .collect(Collectors.toList());
        }

        private UserResponse convertToUserResponse(User user) {
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
        private TableResponse convertToTableResponse(Tables table) {
                return TableResponse.builder()
                                .id(table.getId())
                                .storeId(table.getStore().getId())
                                .name(table.getName())
                                .status(table.getStatus())
                                .build();
        }
}
