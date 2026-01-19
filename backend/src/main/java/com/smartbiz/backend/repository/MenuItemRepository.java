package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByCategoryId(Long categoryId);

    List<MenuItem> findByCategoryIdAndStatus(Long categoryId, Boolean status);

    @Query("SELECT mi FROM MenuItem mi WHERE mi.category.store.id = :storeId")
    List<MenuItem> findByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT mi FROM MenuItem mi WHERE mi.category.store.id = :storeId AND mi.status = true")
    List<MenuItem> findActiveByStoreId(@Param("storeId") Long storeId);
}
