package com.smartbiz.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        ensureUsersStoreNameColumn();
        ensureStoresBranchNameColumn();
        ensurePendingRegistrationsStoreNameColumn();
        backfillUsersStoreName();
        backfillStoresBranchName();
        backfillPendingRegistrationsStoreName();
        
        ensureStaffAccountTable();
        migrateExistingStaffData();
        dropLegacyUsersStaffColumns();

        dropLegacyStoresNameColumn();
    }

    private void ensureUsersStoreNameColumn() {
        if (!columnExists("users", "store_name")) {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN store_name VARCHAR(100) NULL AFTER full_name");
            log.info("Added column users.store_name");
        }
    }

    private void ensurePendingRegistrationsStoreNameColumn() {
        if (!tableExists("pending_registrations")) {
            return;
        }

        if (!columnExists("pending_registrations", "store_name")) {
            jdbcTemplate.execute(
                    "ALTER TABLE pending_registrations ADD COLUMN store_name VARCHAR(100) NULL AFTER full_name");
            log.info("Added column pending_registrations.store_name");
        }
    }

    private void ensureUsersOnboardingCompletedColumn() {
        if (!columnExists("users", "onboarding_completed")) {
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD COLUMN onboarding_completed BIT(1) NOT NULL DEFAULT b'1' AFTER store_name");
            log.info("Added column users.onboarding_completed");
        }
    }

    private void ensureUsersTemporaryPasswordColumn() {
        if (!columnExists("users", "temporary_password")) {
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD COLUMN temporary_password VARCHAR(100) NULL AFTER salary_amount");
            log.info("Added column users.temporary_password");
        }
    }

    private void ensureStoresBranchNameColumn() {
        if (!tableExists("stores")) {
            return;
        }

        if (!columnExists("stores", "branch_name")) {
            jdbcTemplate.execute(
                    "ALTER TABLE stores ADD COLUMN branch_name VARCHAR(100) NULL AFTER owner_id");
            log.info("Added column stores.branch_name");
        }
    }

    private void backfillUsersStoreName() {
        jdbcTemplate.update(
                "UPDATE users SET store_name = COALESCE(NULLIF(store_name, ''), full_name) " +
                        "WHERE store_name IS NULL OR TRIM(store_name) = ''");

        if (tableExists("stores") && columnExists("stores", "name")) {
            jdbcTemplate.update(
                    "UPDATE users u " +
                            "JOIN (SELECT owner_id, MAX(name) AS store_name FROM stores GROUP BY owner_id) s " +
                            "ON s.owner_id = u.id " +
                            "SET u.store_name = s.store_name " +
                            "WHERE s.store_name IS NOT NULL AND TRIM(s.store_name) <> ''");
        }
    }

    private void backfillPendingRegistrationsStoreName() {
        if (!tableExists("pending_registrations") || !columnExists("pending_registrations", "store_name")) {
            return;
        }

        jdbcTemplate.update(
                "UPDATE pending_registrations " +
                        "SET store_name = COALESCE(NULLIF(store_name, ''), full_name) " +
                        "WHERE store_name IS NULL OR TRIM(store_name) = ''");

        jdbcTemplate.execute("ALTER TABLE pending_registrations MODIFY COLUMN store_name VARCHAR(100) NOT NULL");
    }

    private void backfillUsersOnboardingCompleted() {
        if (!columnExists("users", "onboarding_completed")) {
            return;
        }

        jdbcTemplate.update(
                "UPDATE users SET onboarding_completed = b'1' WHERE onboarding_completed IS NULL");
    }

    private void backfillStoresBranchName() {
        if (!tableExists("stores") || !columnExists("stores", "branch_name")) {
            return;
        }

        if (columnExists("stores", "name")) {
            jdbcTemplate.update(
                    "UPDATE stores SET branch_name = COALESCE(NULLIF(branch_name, ''), NULLIF(name, ''), address) " +
                            "WHERE branch_name IS NULL OR TRIM(branch_name) = ''");
        } else {
            jdbcTemplate.update(
                    "UPDATE stores SET branch_name = COALESCE(NULLIF(branch_name, ''), address) " +
                            "WHERE branch_name IS NULL OR TRIM(branch_name) = ''");
        }
    }

    private void dropLegacyStoresNameColumn() {
        if (!tableExists("stores") || !columnExists("stores", "name")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE stores DROP COLUMN name");
        log.info("Dropped legacy column stores.name");
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                Integer.class,
                tableName);
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName);
        return count != null && count > 0;
    }

    private void ensureStaffAccountTable() {
        if (!tableExists("staff_account")) {
            jdbcTemplate.execute(
                "CREATE TABLE staff_account (" +
                "  user_id VARCHAR(36) NOT NULL," +
                "  salary_type VARCHAR(50) NULL," +
                "  salary_amount DECIMAL(12,2) NULL," +
                "  temporary_password VARCHAR(100) NULL," +
                "  onboarding_completed BIT(1) NOT NULL DEFAULT b'0'," +
                "  PRIMARY KEY (user_id)," +
                "  CONSTRAINT fk_staff_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
            log.info("Created table staff_account");
        }
    }

    private void migrateExistingStaffData() {
        if (columnExists("users", "salary_type") || columnExists("users", "salary_amount") ||
            columnExists("users", "temporary_password") || columnExists("users", "onboarding_completed")) {
            
            log.info("Migrating existing staff data to staff_account table...");
            jdbcTemplate.execute(
                "INSERT INTO staff_account (user_id, salary_type, salary_amount, temporary_password, onboarding_completed) " +
                "SELECT u.id, u.salary_type, u.salary_amount, u.temporary_password, COALESCE(u.onboarding_completed, b'1') " +
                "FROM users u " +
                "LEFT JOIN staff_account sa ON u.id = sa.user_id " +
                "WHERE u.role IN ('STAFF', 'CASHIER', 'KITCHEN') AND sa.user_id IS NULL"
            );
            log.info("Finished migrating staff data.");
        }
    }

    private void dropLegacyUsersStaffColumns() {
        if (columnExists("users", "salary_type")) {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN salary_type");
            log.info("Dropped column users.salary_type");
        }
        if (columnExists("users", "salary_amount")) {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN salary_amount");
            log.info("Dropped column users.salary_amount");
        }
        if (columnExists("users", "temporary_password")) {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN temporary_password");
            log.info("Dropped column users.temporary_password");
        }
        if (columnExists("users", "onboarding_completed")) {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN onboarding_completed");
            log.info("Dropped column users.onboarding_completed");
        }
    }
}
