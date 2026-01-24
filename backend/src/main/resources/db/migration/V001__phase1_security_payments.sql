-- Phase 1: Core Security & Payments - Database Migration
-- Created: 2026-01-22
-- Description: Add tables for payment transactions, OTP codes, user sessions, and audit logs

-- ============================================
-- 1. Payment Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'WALLET', 'VNPAY') NOT NULL,
    payment_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    vnpay_transaction_no VARCHAR(50),
    vnpay_bank_code VARCHAR(20),
    vnpay_card_type VARCHAR(20),
    vnpay_response_code VARCHAR(10),
    vnpay_secure_hash VARCHAR(255),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_transaction_code (transaction_code),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. OTP Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_otp (user_id, otp_code, otp_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. User Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    two_factor_verified BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Audit Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('SUCCESS', 'FAILED') NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Update Users Table for 2FA
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32),
ADD COLUMN IF NOT EXISTS backup_codes TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP NULL;

-- Add indexes for performance
ALTER TABLE users
ADD INDEX IF NOT EXISTS idx_two_factor_enabled (two_factor_enabled),
ADD INDEX IF NOT EXISTS idx_last_login_at (last_login_at),
ADD INDEX IF NOT EXISTS idx_account_locked_until (account_locked_until);

-- ============================================
-- 6. Update Invoices Table for Payment Status
-- ============================================
-- Check if payment_status column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'invoices';
SET @columnname = 'payment_status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''UNPAID'', ''PAID'', ''PARTIALLY_PAID'', ''REFUNDED'') DEFAULT ''UNPAID''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 7. Insert Sample Data (Optional - for testing)
-- ============================================

-- Sample audit log entry
INSERT INTO audit_logs (user_id, action, entity_type, status, ip_address, created_at)
SELECT id, 'SYSTEM_MIGRATION', 'DATABASE', 'SUCCESS', '127.0.0.1', NOW()
FROM users 
WHERE role = 'ADMIN' 
LIMIT 1;

-- ============================================
-- Migration Complete
-- ============================================
SELECT 'Phase 1 database migration completed successfully!' AS message;
