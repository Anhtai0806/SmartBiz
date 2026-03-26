package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerId(UUID ownerId);

    List<Store> findByStaffMembersId(UUID staffId);

    Optional<Store> findFirstByStaffMembersId(UUID staffId);

    boolean existsByIdAndOwnerId(Long storeId, UUID ownerId);
}
