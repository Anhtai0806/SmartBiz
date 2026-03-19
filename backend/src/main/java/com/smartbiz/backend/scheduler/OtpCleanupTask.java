package com.smartbiz.backend.scheduler;

import com.smartbiz.backend.repository.OtpCodeRepository;
import com.smartbiz.backend.repository.PendingRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpCleanupTask {

    private final OtpCodeRepository otpCodeRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    /**
     * Nhiệm vụ: Xóa các mã OTP đã quá hạn hoặc đã được sử dụng khỏi DB
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanExpiredOtps() {
        log.info("Starting OTP cleanup task...");
        try {
            otpCodeRepository.deleteByExpiresAtBeforeOrIsUsedTrue(LocalDateTime.now());
            pendingRegistrationRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            log.info("Successfully cleaned up expired or used OTPs.");
        } catch (Exception e) {
            log.error("Error occurred while clean up OTPs: ", e);
        }
    }
}
