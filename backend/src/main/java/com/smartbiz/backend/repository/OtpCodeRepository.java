package com.smartbiz.backend.repository;

import com.smartbiz.backend.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(
            UUID userId,
            OtpCode.OtpType otpType
    );

    List<OtpCode> findByUserIdAndOtpTypeAndIsUsedFalse(UUID userId, OtpCode.OtpType otpType);
}
