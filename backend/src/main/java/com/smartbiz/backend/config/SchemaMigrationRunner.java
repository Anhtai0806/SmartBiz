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
        ensureUsersOnboardingCompletedColumn();
        ensureUsersTemporaryPasswordColumn();
        ensureStoresBranchNameColumn();
        ensurePendingRegistrationsStoreNameColumn();
        backfillUsersStoreName();
        backfillStoresBranchName();
        backfillUsersOnboardingCompleted();
        backfillPendingRegistrationsStoreName();
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
}
