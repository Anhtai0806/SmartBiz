-- V006__create_staff_account.sql
-- Create staff_account table and migrate existing user columns

CREATE TABLE IF NOT EXISTS `staff_account` (
    `user_id` VARCHAR(36) NOT NULL,
    `salary_type` VARCHAR(50) NULL,
    `salary_amount` DECIMAL(12,2) NULL,
    `temporary_password` VARCHAR(100) NULL,
    `onboarding_completed` BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_staff_account_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing staff details if columns exist in users table
-- Note: The application's SchemaMigrationRunner handles the programmatic check, data transfer, and column dropping dynamically on boot.
