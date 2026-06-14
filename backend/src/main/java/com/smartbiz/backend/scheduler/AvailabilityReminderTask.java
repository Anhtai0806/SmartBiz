package com.smartbiz.backend.scheduler;

import com.smartbiz.backend.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AvailabilityReminderTask {

    private final AvailabilityService availabilityService;

    @Scheduled(cron = "0 0 0 * * FRI", zone = "Asia/Ho_Chi_Minh")
    public void remindAtFridayStart() {
        log.info("Starting Friday availability reminder task...");
        availabilityService.sendFridayStartReminders();
    }

    @Scheduled(cron = "0 0 0 * * SAT", zone = "Asia/Ho_Chi_Minh")
    public void remindMissingAfterFriday() {
        log.info("Starting missing availability reminder task...");
        availabilityService.sendMissingSubmissionReminders();
    }
}
