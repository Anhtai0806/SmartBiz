package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.AvailabilitySlotRequest;
import com.smartbiz.backend.dto.AvailabilitySlotResponse;
import com.smartbiz.backend.dto.AvailabilitySubmitRequest;
import com.smartbiz.backend.dto.AvailabilityWeekResponse;
import com.smartbiz.backend.dto.WorkShiftResponse;
import com.smartbiz.backend.entity.StaffAvailabilitySlot;
import com.smartbiz.backend.entity.StaffAvailabilitySubmission;
import com.smartbiz.backend.entity.Store;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.entity.WorkShift;
import com.smartbiz.backend.enums.Role;
import com.smartbiz.backend.enums.Status;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.StaffAvailabilitySlotRepository;
import com.smartbiz.backend.repository.StaffAvailabilitySubmissionRepository;
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AvailabilityService {

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final StaffAvailabilitySubmissionRepository submissionRepository;
    private final StaffAvailabilitySlotRepository slotRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final WorkShiftRepository workShiftRepository;
    private final AvailabilityReminderMailService reminderMailService;

    public List<WorkShiftResponse> getShiftTemplates(@NonNull UUID userId, @NonNull Long storeId) {
        Store store = resolveAssignedStore(userId, storeId);

        return workShiftRepository.findByStoreId(requireValue(store.getId(), "store.id")).stream()
                .map(this::convertToWorkShiftResponse)
                .collect(Collectors.toList());
    }

    public AvailabilityWeekResponse getMyAvailability(@NonNull UUID userId, @NonNull Long storeId, LocalDate weekStart) {
        Store store = resolveAssignedStore(userId, storeId);
        User user = userRepository.findById(requireValue(userId, "userId"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate normalizedWeekStart = normalizeWeekStart(weekStart);

        return submissionRepository
                .findByUser_IdAndStore_IdAndWeekStart(userId, requireValue(store.getId(), "store.id"),
                        normalizedWeekStart)
                .map(this::convertToAvailabilityWeekResponse)
                .orElseGet(() -> emptyAvailabilityResponse(user, store, normalizedWeekStart));
    }

    @Transactional
    public AvailabilityWeekResponse submitAvailability(@NonNull UUID userId, @NonNull AvailabilitySubmitRequest request) {
        Long storeId = requireValue(request.getStoreId(), "storeId");
        Store store = resolveAssignedStore(userId, storeId);
        User user = userRepository.findById(requireValue(userId, "userId"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate weekStart = normalizeWeekStart(request.getWeekStart());
        LocalDate weekEnd = weekStart.plusDays(6);

        StaffAvailabilitySubmission submission = submissionRepository
                .findByUser_IdAndStore_IdAndWeekStart(userId, storeId, weekStart)
                .orElseGet(() -> StaffAvailabilitySubmission.builder()
                        .user(user)
                        .store(store)
                        .weekStart(weekStart)
                        .submittedAt(LocalDateTime.now(VIETNAM_ZONE))
                        .updatedAt(LocalDateTime.now(VIETNAM_ZONE))
                        .build());

        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        if (submission.getSubmittedAt() == null) {
            submission.setSubmittedAt(now);
        }
        submission.setUpdatedAt(now);

        StaffAvailabilitySubmission savedSubmission = submissionRepository.save(requireValue(submission, "submission"));
        Long submissionId = requireValue(savedSubmission.getId(), "submission.id");
        slotRepository.deleteBySubmission_Id(submissionId);
        savedSubmission.getSlots().clear();

        Set<String> seenSlots = new HashSet<>();
        for (AvailabilitySlotRequest slotRequest : requireValue(request.getSlots(), "slots")) {
            AvailabilitySlotRequest checkedSlotRequest = requireValue(slotRequest, "slotRequest");
            LocalDate availableDate = requireValue(checkedSlotRequest.getAvailableDate(), "availableDate");
            if (availableDate.isBefore(weekStart) || availableDate.isAfter(weekEnd)) {
                throw new IllegalArgumentException("Ngày đăng ký phải nằm trong tuần kế tiếp đã chọn");
            }

            Long workShiftId = requireValue(checkedSlotRequest.getWorkShiftId(), "workShiftId");
            String slotKey = availableDate + ":" + workShiftId;
            if (!seenSlots.add(slotKey)) {
                continue;
            }

            WorkShift workShift = workShiftRepository.findById(workShiftId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shift template not found with id: " + workShiftId));
            Store workShiftStore = requireValue(workShift.getStore(), "workShift.store");
            if (!requireValue(workShiftStore.getId(), "workShift.store.id").equals(storeId)) {
                throw new IllegalArgumentException("Ca làm không thuộc cửa hàng đã chọn");
            }

            StaffAvailabilitySlot slot = StaffAvailabilitySlot.builder()
                    .submission(savedSubmission)
                    .availableDate(availableDate)
                    .workShift(workShift)
                    .build();
            savedSubmission.getSlots().add(requireValue(slot, "slot"));
        }

        StaffAvailabilitySubmission updatedSubmission = submissionRepository.save(requireValue(savedSubmission,
                "savedSubmission"));
        return convertToAvailabilityWeekResponse(requireValue(updatedSubmission, "updatedSubmission"));
    }

    @Transactional
    public void sendFridayStartReminders() {
        LocalDate weekStart = nextWeekStart(LocalDate.now(VIETNAM_ZONE));
        sendReminders(weekStart, false);
    }

    @Transactional
    public void sendMissingSubmissionReminders() {
        LocalDate weekStart = nextWeekStart(LocalDate.now(VIETNAM_ZONE));
        sendReminders(weekStart, true);
    }

    private void sendReminders(@NonNull LocalDate weekStart, boolean missingOnly) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<Store> stores = storeRepository.findAll();

        for (Store store : stores) {
            Store checkedStore = requireValue(store, "store");
            Long storeId = requireValue(checkedStore.getId(), "store.id");
            String storeName = resolveStoreName(checkedStore);

            for (User staffMember : requireValue(checkedStore.getStaffMembers(), "store.staffMembers")) {
                User user = requireValue(staffMember, "staffMember");
                if (!isAvailabilityRole(user) || user.getStatus() != Status.ACTIVE || user.getEmail() == null) {
                    continue;
                }

                UUID userId = requireValue(user.getId(), "user.id");
                boolean submitted = submissionRepository.existsByUser_IdAndStore_IdAndWeekStart(userId, storeId,
                        weekStart);
                if (missingOnly && submitted) {
                    continue;
                }

                try {
                    if (missingOnly) {
                        reminderMailService.sendMissingReminder(user.getEmail(), resolveEmployeeName(user), storeName,
                                weekStart, weekEnd);
                    } else {
                        reminderMailService.sendInitialReminder(user.getEmail(), resolveEmployeeName(user), storeName,
                                weekStart, weekEnd);
                    }
                } catch (RuntimeException ex) {
                    log.error("Failed to send availability reminder to {}", user.getEmail(), ex);
                }
            }
        }
    }

    private Store resolveAssignedStore(@NonNull UUID userId, @NonNull Long storeId) {
        User user = userRepository.findById(requireValue(userId, "userId"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!isAvailabilityRole(user)) {
            throw new UnauthorizedException("Only staff, cashier, or kitchen users can submit availability");
        }

        Store store = storeRepository.findById(requireValue(storeId, "storeId"))
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        boolean assignedToStore = requireValue(store.getStaffMembers(), "store.staffMembers").stream()
                .anyMatch(staff -> requireValue(staff, "staff").getId().equals(userId));
        if (!assignedToStore) {
            throw new UnauthorizedException("Bạn không thuộc cửa hàng này");
        }

        return store;
    }

    private boolean isAvailabilityRole(@NonNull User user) {
        Role role = requireValue(user.getRole(), "user.role");
        return role == Role.STAFF || role == Role.CASHIER || role == Role.KITCHEN;
    }

    private LocalDate normalizeWeekStart(LocalDate weekStart) {
        LocalDate expectedWeekStart = nextWeekStart(LocalDate.now(VIETNAM_ZONE));
        LocalDate resolvedWeekStart = weekStart != null ? weekStart : expectedWeekStart;
        if (resolvedWeekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("Tuần đăng ký phải bắt đầu vào thứ Hai");
        }
        if (!resolvedWeekStart.equals(expectedWeekStart)) {
            throw new IllegalArgumentException("Chỉ được gửi lịch rảnh cho tuần kế tiếp");
        }
        return resolvedWeekStart;
    }

    private LocalDate nextWeekStart(@NonNull LocalDate date) {
        return requireValue(date, "date").with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    }

    private AvailabilityWeekResponse emptyAvailabilityResponse(@NonNull User user, @NonNull Store store,
            @NonNull LocalDate weekStart) {
        return AvailabilityWeekResponse.builder()
                .userId(user.getId())
                .userFullName(resolveEmployeeName(user))
                .storeId(store.getId())
                .storeName(resolveStoreName(store))
                .weekStart(weekStart)
                .weekEnd(weekStart.plusDays(6))
                .submitted(false)
                .build();
    }

    private AvailabilityWeekResponse convertToAvailabilityWeekResponse(@NonNull StaffAvailabilitySubmission submission) {
        User user = requireValue(submission.getUser(), "submission.user");
        Store store = requireValue(submission.getStore(), "submission.store");
        LocalDate weekStart = requireValue(submission.getWeekStart(), "submission.weekStart");

        List<AvailabilitySlotResponse> slots = requireValue(submission.getSlots(), "submission.slots").stream()
                .map(this::convertToSlotResponse)
                .collect(Collectors.toList());

        return AvailabilityWeekResponse.builder()
                .submissionId(submission.getId())
                .userId(user.getId())
                .userFullName(resolveEmployeeName(user))
                .storeId(store.getId())
                .storeName(resolveStoreName(store))
                .weekStart(weekStart)
                .weekEnd(weekStart.plusDays(6))
                .submitted(true)
                .submittedAt(submission.getSubmittedAt())
                .updatedAt(submission.getUpdatedAt())
                .slots(slots)
                .build();
    }

    private AvailabilitySlotResponse convertToSlotResponse(@NonNull StaffAvailabilitySlot slot) {
        WorkShift workShift = requireValue(slot.getWorkShift(), "slot.workShift");
        return AvailabilitySlotResponse.builder()
                .id(slot.getId())
                .availableDate(slot.getAvailableDate())
                .workShiftId(workShift.getId())
                .workShiftName(workShift.getName())
                .startTime(workShift.getStartTime().toString())
                .endTime(workShift.getEndTime().toString())
                .build();
    }

    private WorkShiftResponse convertToWorkShiftResponse(@NonNull WorkShift workShift) {
        Store store = requireValue(workShift.getStore(), "workShift.store");
        return WorkShiftResponse.builder()
                .id(workShift.getId())
                .storeId(store.getId())
                .storeName(resolveStoreName(store))
                .name(workShift.getName())
                .startTime(workShift.getStartTime().toString())
                .endTime(workShift.getEndTime().toString())
                .build();
    }

    private String resolveStoreName(@NonNull Store store) {
        String storeName = store.getName();
        return storeName != null && !storeName.isBlank() ? storeName : "Cửa hàng";
    }

    private String resolveEmployeeName(@NonNull User user) {
        String fullName = user.getFullName();
        return fullName != null && !fullName.isBlank() ? fullName : user.getEmail();
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
