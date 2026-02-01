package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.QRPaymentCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QRPaymentCodeRepository extends JpaRepository<QRPaymentCode, Long> {

    Optional<QRPaymentCode> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
