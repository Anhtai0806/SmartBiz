package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.Invoice;
import com.smartbiz.backend.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
}
