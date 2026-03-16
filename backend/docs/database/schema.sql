-- ============================================
-- SmartBiz Database Schema
-- MySQL 8.0+
-- ============================================

-- Drop existing database and create new one
DROP DATABASE IF EXISTS smartbiz;
CREATE DATABASE smartbiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartbiz;

-- ============================================
-- Table: users
-- Description: Stores user information with UUID primary key
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create `users` table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL, -- UUID
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(100) UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `role` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `salary_type` VARCHAR(50),
    `salary_amount` DECIMAL(12,2),
    `created_at` DATETIME NOT NULL,
    `two_factor_enabled` BOOLEAN DEFAULT FALSE,
    `two_factor_secret` VARCHAR(32),
    `backup_codes` TEXT,
    `last_login_at` DATETIME,
    `failed_login_attempts` INT DEFAULT 0,
    `account_locked_until` DATETIME,
    PRIMARY KEY (`id`)
);

-- 2. Create `stores` table
DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `owner_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `opening_time` TIME,
    `closing_time` TIME,
    `tax_rate` DECIMAL(5,2),
    `phone` VARCHAR(20),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 3. Create `tables` table (Restaurant Tables)
DROP TABLE IF EXISTS `tables`;
CREATE TABLE `tables` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
);

-- 4. Create `menu_categories` table
DROP TABLE IF EXISTS `menu_categories`;
CREATE TABLE `menu_categories` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
);

-- 5. Create `menu_items` table
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE
);

-- 6. Create `work_shifts` table (Shift Templates)
DROP TABLE IF EXISTS `work_shifts`;
CREATE TABLE `work_shifts` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
);

-- 7. Create `staff_shifts` table
DROP TABLE IF EXISTS `staff_shifts`;
CREATE TABLE `staff_shifts` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `store_id` BIGINT NOT NULL,
    `work_shift_id` BIGINT,
    `shift_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`work_shift_id`) REFERENCES `work_shifts` (`id`) ON DELETE SET NULL
);

-- 8. Create `orders` table
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `table_id` BIGINT NOT NULL,
    `staff_id` VARCHAR(36) NOT NULL,
    `shift_id` BIGINT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_id`) REFERENCES `staff_shifts` (`id`) ON DELETE CASCADE
);

-- 9. Create `order_items` table
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `order_id` BIGINT NOT NULL,
    `menu_item_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
);

-- 10. Create `invoices` table
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `order_id` BIGINT NOT NULL UNIQUE,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
);

-- 11. Create `payment_transactions` table
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `invoice_id` BIGINT NOT NULL,
    `transaction_code` VARCHAR(50) NOT NULL UNIQUE,
    `amount` DECIMAL(15,2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` VARCHAR(50) NOT NULL,
    `vnpay_transaction_no` VARCHAR(50),
    `vnpay_bank_code` VARCHAR(20),
    `vnpay_card_type` VARCHAR(20),
    `vnpay_response_code` VARCHAR(10),
    `vnpay_secure_hash` VARCHAR(255),
    `payment_date` DATETIME,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
);

-- 12. Create `staff_store` table (Many-To-Many relationship)
DROP TABLE IF EXISTS `staff_store`;
CREATE TABLE `staff_store` (
    `store_id` BIGINT NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`store_id`, `user_id`),
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 13. Create `qr_payment_codes` table
DROP TABLE IF EXISTS `qr_payment_codes`;
CREATE TABLE `qr_payment_codes` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` VARCHAR(36) NOT NULL UNIQUE,
    `image_data` LONGTEXT NOT NULL,
    `image_name` VARCHAR(255),
    `image_type` VARCHAR(50),
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 14. Create `otp_codes` table
DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE `otp_codes` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `otp_code` VARCHAR(6) NOT NULL,
    `otp_type` VARCHAR(50) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `is_used` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 15. Create `audit_logs` table
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` VARCHAR(36),
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50),
    `entity_id` VARCHAR(50),
    `old_value` TEXT,
    `new_value` TEXT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `status` VARCHAR(50) NOT NULL,
    `error_message` TEXT,
    `created_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```
