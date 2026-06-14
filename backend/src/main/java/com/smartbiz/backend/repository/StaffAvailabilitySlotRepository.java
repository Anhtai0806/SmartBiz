package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.StaffAvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffAvailabilitySlotRepository extends JpaRepository<StaffAvailabilitySlot, Long> {

    void deleteBySubmission_Id(Long submissionId);
}
