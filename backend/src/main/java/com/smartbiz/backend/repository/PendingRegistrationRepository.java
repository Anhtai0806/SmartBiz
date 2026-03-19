package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, UUID> {
    Optional<PendingRegistration> findByEmail(String email);

    Optional<PendingRegistration> findByPhone(String phone);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
