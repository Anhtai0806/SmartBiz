package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.StaffAvailabilitySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffAvailabilitySubmissionRepository extends JpaRepository<StaffAvailabilitySubmission, Long> {

    Optional<StaffAvailabilitySubmission> findByUser_IdAndStore_IdAndWeekStart(UUID userId, Long storeId,
            LocalDate weekStart);

    boolean existsByUser_IdAndStore_IdAndWeekStart(UUID userId, Long storeId, LocalDate weekStart);
}
