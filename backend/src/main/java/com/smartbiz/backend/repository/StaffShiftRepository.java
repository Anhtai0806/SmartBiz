package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.StaffShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, Long> {

    List<StaffShift> findByUserId(UUID userId);

    List<StaffShift> findByStoreId(Long storeId);

    List<StaffShift> findByUserIdAndShiftDate(UUID userId, LocalDate shiftDate);

    List<StaffShift> findByStoreIdAndShiftDate(Long storeId, LocalDate shiftDate);

    List<StaffShift> findByUserIdAndShiftDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);

    List<StaffShift> findByStoreIdAndShiftDateBetween(Long storeId, LocalDate startDate, LocalDate endDate);
}
