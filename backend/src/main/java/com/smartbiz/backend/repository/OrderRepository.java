package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.Order;
import com.smartbiz.backend.enums.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

        List<Order> findByTableId(Long tableId);

        List<Order> findByStaffId(UUID staffId);

        List<Order> findByShiftId(Long shiftId);

        List<Order> findByStatus(OrderStatus status);

        List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);

        @Query("SELECT o FROM Order o WHERE o.table.store.id = :storeId")
        List<Order> findByStoreId(@Param("storeId") Long storeId);

        @Query("SELECT o FROM Order o WHERE o.table.store.id = :storeId AND o.status = :status")
        List<Order> findByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") OrderStatus status);

        @Query("SELECT o FROM Order o WHERE o.table.store.id = :storeId AND o.createdAt BETWEEN :start AND :end")
        List<Order> findByStoreIdAndCreatedAtBetween(
                        @Param("storeId") Long storeId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT o FROM Order o WHERE o.table.id = :tableId AND (o.status IN ('NEW', 'PROCESSING') OR (o.status = 'DONE' AND o.table.status = 'WAITING_PAYMENT')) ORDER BY o.createdAt DESC")
        List<Order> findActiveOrderByTableId(@Param("tableId") Long tableId);

        @Query("SELECT COUNT(o) FROM Order o WHERE o.table.store.id = :storeId AND o.createdAt BETWEEN :start AND :end")
        Long countByStoreIdAndCreatedAtBetween(
                        @Param("storeId") Long storeId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT COUNT(o) FROM Order o WHERE o.table.store.id = :storeId AND o.status = :status AND o.createdAt BETWEEN :start AND :end")
        Long countByStoreIdAndStatusAndCreatedAtBetween(
                        @Param("storeId") Long storeId,
                        @Param("status") OrderStatus status,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT o FROM Order o WHERE o.table.store.id = :storeId AND o.status = :status")
        List<Order> findByTableStoreIdAndStatus(
                        @Param("storeId") Long storeId,
                        @Param("status") OrderStatus status);

        // Kitchen-specific queries
        List<Order> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);

        long countByStatusIn(List<OrderStatus> statuses);

        long countByStatusAndCreatedAtAfter(OrderStatus status, LocalDateTime createdAt);
}
