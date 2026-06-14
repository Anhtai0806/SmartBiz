CREATE TABLE IF NOT EXISTS staff_availability_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    store_id BIGINT NOT NULL,
    week_start DATE NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_availability_submission_user_store_week UNIQUE (user_id, store_id, week_start),
    CONSTRAINT fk_availability_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_availability_submission_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_availability_submission_week (week_start),
    INDEX idx_availability_submission_store_week (store_id, week_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_availability_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    available_date DATE NOT NULL,
    work_shift_id BIGINT NOT NULL,
    CONSTRAINT uk_availability_slot_submission_date_shift UNIQUE (submission_id, available_date, work_shift_id),
    CONSTRAINT fk_availability_slot_submission FOREIGN KEY (submission_id) REFERENCES staff_availability_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_availability_slot_work_shift FOREIGN KEY (work_shift_id) REFERENCES work_shifts(id) ON DELETE CASCADE,
    INDEX idx_availability_slot_date (available_date),
    INDEX idx_availability_slot_work_shift (work_shift_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
