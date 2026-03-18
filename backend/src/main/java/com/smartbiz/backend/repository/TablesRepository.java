package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.Tables;
import com.smartbiz.backend.enums.TableStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TablesRepository extends JpaRepository<Tables, Long> {

    List<Tables> findByStoreId(Long storeId);

    List<Tables> findByStoreIdAndStatus(Long storeId, TableStatus status);

    boolean existsByIdAndStoreId(Long tableId, Long storeId);
}
