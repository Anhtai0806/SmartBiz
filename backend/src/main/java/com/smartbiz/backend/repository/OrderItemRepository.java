package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

        List<OrderItem> findByOrderId(Long orderId);

        List<OrderItem> findByMenuItemId(Long menuItemId);

        @Query("SELECT oi FROM OrderItem oi WHERE oi.order.table.store.id = :storeId")
        List<OrderItem> findByStoreId(@Param("storeId") Long storeId);

        void deleteByOrderId(Long orderId);

        @Query("SELECT oi.menuItem.id, oi.menuItem.name, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
                        "FROM OrderItem oi " +
                        "WHERE oi.order.table.store.owner.id = :ownerId " +
                        "AND (:storeId IS NULL OR oi.order.table.store.id = :storeId) " +
                        "AND oi.order.createdAt BETWEEN :start AND :end " +
                        "GROUP BY oi.menuItem.id, oi.menuItem.name " +
                        "ORDER BY SUM(oi.quantity) DESC")
        List<Object[]> getTopProductsByOwnerId(
                        @Param("ownerId") java.util.UUID ownerId,
                        @Param("storeId") Long storeId,
                        @Param("start") java.time.LocalDateTime start,
                        @Param("end") java.time.LocalDateTime end,
                        org.springframework.data.domain.Pageable pageable);
}
