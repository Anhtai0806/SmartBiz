package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.Invoice;
import com.smartbiz.backend.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

        Optional<Invoice> findByOrderId(Long orderId);

        List<Invoice> findByPaymentMethod(PaymentMethod paymentMethod);

        @Query("SELECT i FROM Invoice i WHERE i.order.table.store.id = :storeId")
        List<Invoice> findByStoreId(@Param("storeId") Long storeId);

        @Query("SELECT i FROM Invoice i WHERE i.order.table.store.id = :storeId AND i.createdAt BETWEEN :start AND :end")
        List<Invoice> findByStoreIdAndCreatedAtBetween(
                        @Param("storeId") Long storeId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT i FROM Invoice i WHERE i.order.table.store.id = :storeId AND i.paymentMethod = :paymentMethod")
        List<Invoice> findByStoreIdAndPaymentMethod(
                        @Param("storeId") Long storeId,
                        @Param("paymentMethod") PaymentMethod paymentMethod);

        @Query("SELECT i FROM Invoice i WHERE i.order.table.store.id = :storeId")
        List<Invoice> findByOrderTableStoreId(@Param("storeId") Long storeId);

        boolean existsByOrderId(Long orderId);

        @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.order.table.store.id = :storeId AND i.createdAt BETWEEN :start AND :end")
        BigDecimal sumTotalAmountByStoreIdAndCreatedAtBetween(
                        @Param("storeId") Long storeId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT DATE(i.createdAt) as date, SUM(i.totalAmount) as revenue, COUNT(i) as orders " +
                        "FROM Invoice i " +
                        "WHERE i.order.table.store.owner.id = :ownerId " +
                        "AND (:storeId IS NULL OR i.order.table.store.id = :storeId) " +
                        "AND i.createdAt BETWEEN :start AND :end " +
                        "GROUP BY DATE(i.createdAt) " +
                        "ORDER BY DATE(i.createdAt)")
        List<Object[]> getRevenueReportByOwnerId(
                        @Param("ownerId") java.util.UUID ownerId,
                        @Param("storeId") Long storeId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT i.order.table.store.id, i.order.table.store.name, SUM(i.totalAmount), COUNT(i) " +
                        "FROM Invoice i " +
                        "WHERE i.order.table.store.owner.id = :ownerId " +
                        "AND i.createdAt BETWEEN :start AND :end " +
                        "GROUP BY i.order.table.store.id, i.order.table.store.name")
        List<Object[]> getStoreComparisonByOwnerId(
                        @Param("ownerId") java.util.UUID ownerId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);
}
