package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {

    /**
     * Find all shift templates for a specific store
     * 
     * @param storeId Store ID
     * @return List of shift templates
     */
    List<WorkShift> findByStoreId(Long storeId);
}
