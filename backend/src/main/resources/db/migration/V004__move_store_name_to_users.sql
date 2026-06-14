ALTER TABLE users
ADD COLUMN IF NOT EXISTS store_name VARCHAR(100) NULL AFTER full_name;

ALTER TABLE pending_registrations
ADD COLUMN IF NOT EXISTS store_name VARCHAR(100) NULL AFTER full_name;

UPDATE users
SET store_name = COALESCE(store_name, full_name)
WHERE store_name IS NULL OR TRIM(store_name) = '';

UPDATE pending_registrations
SET store_name = COALESCE(store_name, full_name)
WHERE store_name IS NULL OR TRIM(store_name) = '';

UPDATE users u
JOIN (
    SELECT owner_id, MAX(name) AS store_name
    FROM stores
    GROUP BY owner_id
) s ON s.owner_id = u.id
SET u.store_name = s.store_name
WHERE s.store_name IS NOT NULL AND TRIM(s.store_name) <> '';

UPDATE pending_registrations
SET store_name = COALESCE(store_name, full_name)
WHERE store_name IS NULL OR TRIM(store_name) = '';

ALTER TABLE pending_registrations
MODIFY COLUMN store_name VARCHAR(100) NOT NULL;

SET @dbname = DATABASE();
SET @tablename = 'stores';
SET @columnname = 'name';
SET @preparedStatement = (
    SELECT IF(
        (
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_schema = @dbname
              AND table_name = @tablename
              AND column_name = @columnname
        ) > 0,
        CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname),
        'SELECT 1'
    )
);
PREPARE dropStoreNameColumnIfExists FROM @preparedStatement;
EXECUTE dropStoreNameColumnIfExists;
DEALLOCATE PREPARE dropStoreNameColumnIfExists;
