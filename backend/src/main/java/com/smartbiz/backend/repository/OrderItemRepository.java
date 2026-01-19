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
}
